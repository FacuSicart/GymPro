import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import {
  ExerciseApprovalStatus,
  ExerciseGoal,
  ExerciseOperationalStatus,
  Prisma,
  User,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { paginationArgs } from '../common/pagination-query.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ListExercisesQueryDto } from './dto/list-exercises-query.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { toPublicExercise, toPublicExercises } from './exercise-presenter';

const textSearchMode = 'insensitive' satisfies Prisma.QueryMode;
const expectedExerciseGoals = [
  'STRENGTH',
  'MOBILITY',
  'ENDURANCE',
  'POWER',
  'CORE',
];
const maxImportRows = 500;

type UploadedExerciseFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

type ImportableExerciseField = keyof CreateExerciseDto;

type ParsedImportRow = CreateExerciseDto & { sourceRow: number };

type ImportRowError = {
  row: number;
  errors: string[];
};

type CoverageCountRow = {
  value: string;
  count: bigint | number;
};

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async listExercises(user: User, query: ListExercisesQueryDto) {
    const exercises = await this.prisma.exercise.findMany({
      where: this.buildListWhere(user, query),
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      ...paginationArgs(query),
    });

    return toPublicExercises(exercises);
  }

  async listMyProposals(user: User) {
    const exercises = await this.prisma.exercise.findMany({
      where: {
        createdByUserId: user.id,
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      ...paginationArgs(),
    });

    return toPublicExercises(exercises);
  }

  async getCoverage(user: User) {
    this.assertAdmin(user);

    const [muscleGroups, goals, equipment, equipmentTypes, movementPatterns] =
      await Promise.all([
        this.groupApprovedActiveBy('primary_muscle_group'),
        this.buildEnumArrayCoverage(expectedExerciseGoals),
        this.groupApprovedActiveBy('equipment_needed'),
        this.groupApprovedActiveBy('equipment_type'),
        this.groupApprovedActiveBy('movement_pattern'),
      ]);

    return {
      minimumPerBucket: 2,
      muscleGroups,
      goals,
      equipment,
      equipmentTypes,
      movementPatterns,
    };
  }

  async createExercise(user: User, dto: CreateExerciseDto) {
    const isAdmin = user.role === UserRole.ADMIN;
    const exercise = await this.prisma.exercise.create({
      data: {
        ...this.buildCreateData(dto),
        approvalStatus: isAdmin
          ? ExerciseApprovalStatus.APPROVED
          : ExerciseApprovalStatus.PENDING,
        operationalStatus: isAdmin
          ? ExerciseOperationalStatus.ACTIVE
          : ExerciseOperationalStatus.INACTIVE,
        createdByUserId: user.id,
        reviewedByUserId: isAdmin ? user.id : null,
        reviewedAt: isAdmin ? new Date() : null,
      },
    });

    return toPublicExercise(exercise);
  }

  async getExercise(user: User, exerciseId: string) {
    const exercise = await this.findVisibleExercise(user, exerciseId);

    return toPublicExercise(exercise);
  }

  async updateExercise(user: User, exerciseId: string, dto: UpdateExerciseDto) {
    const existingExercise = await this.findExercise(exerciseId);
    this.assertCanUpdateExercise(user, existingExercise);

    const exercise = await this.prisma.exercise.update({
      where: { id: exerciseId },
      data: this.buildUpdateData(dto),
    });

    return toPublicExercise(exercise);
  }

  async approveExercise(user: User, exerciseId: string) {
    this.assertAdmin(user);
    const exercise = await this.findExercise(exerciseId);

    if (exercise.approvalStatus === ExerciseApprovalStatus.APPROVED) {
      return toPublicExercise(exercise);
    }

    const updatedExercise = await this.prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        approvalStatus: ExerciseApprovalStatus.APPROVED,
        operationalStatus: ExerciseOperationalStatus.ACTIVE,
        reviewedByUserId: user.id,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });

    return toPublicExercise(updatedExercise);
  }

  async rejectExercise(user: User, exerciseId: string, reason?: string) {
    this.assertAdmin(user);
    const exercise = await this.findExercise(exerciseId);

    if (exercise.approvalStatus === ExerciseApprovalStatus.APPROVED) {
      throw new BadRequestException('Approved exercises cannot be rejected.');
    }

    const updatedExercise = await this.prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        approvalStatus: ExerciseApprovalStatus.REJECTED,
        operationalStatus: ExerciseOperationalStatus.INACTIVE,
        reviewedByUserId: user.id,
        reviewedAt: new Date(),
        rejectionReason: this.normalizeOptionalText(reason),
      },
    });

    return toPublicExercise(updatedExercise);
  }

  async setOperationalStatus(
    user: User,
    exerciseId: string,
    operationalStatus: ExerciseOperationalStatus,
  ) {
    this.assertAdmin(user);
    const exercise = await this.findExercise(exerciseId);

    if (
      operationalStatus === ExerciseOperationalStatus.ACTIVE &&
      exercise.approvalStatus !== ExerciseApprovalStatus.APPROVED
    ) {
      throw new BadRequestException(
        'Only approved exercises can be activated.',
      );
    }

    const updatedExercise = await this.prisma.exercise.update({
      where: { id: exercise.id },
      data: { operationalStatus },
    });

    return toPublicExercise(updatedExercise);
  }

  async importExercisesFromExcel(user: User, file?: UploadedExerciseFile) {
    this.assertAdmin(user);

    if (!file?.buffer?.length) {
      throw new BadRequestException('Excel file is required.');
    }

    if (!this.isExcelFile(file)) {
      throw new BadRequestException(
        'Only .xlsx, .xls or .csv files are supported.',
      );
    }

    const parsed = this.parseExerciseWorkbook(file.buffer);

    if (parsed.errors.length) {
      return {
        imported: false,
        totalRows: parsed.totalRows,
        created: 0,
        updated: 0,
        errors: parsed.errors,
      };
    }

    let created = 0;
    let updated = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const row of parsed.rows) {
        const existingExercise = await tx.exercise.findFirst({
          where: { name: { equals: row.name, mode: textSearchMode } },
          select: { id: true },
        });
        const data = this.buildCreateData(row);

        if (existingExercise) {
          await tx.exercise.update({
            where: { id: existingExercise.id },
            data: {
              ...data,
              approvalStatus: ExerciseApprovalStatus.APPROVED,
              operationalStatus: ExerciseOperationalStatus.ACTIVE,
              reviewedByUserId: user.id,
              reviewedAt: new Date(),
              rejectionReason: null,
            },
          });
          updated += 1;
        } else {
          await tx.exercise.create({
            data: {
              ...data,
              approvalStatus: ExerciseApprovalStatus.APPROVED,
              operationalStatus: ExerciseOperationalStatus.ACTIVE,
              createdByUserId: user.id,
              reviewedByUserId: user.id,
              reviewedAt: new Date(),
            },
          });
          created += 1;
        }
      }
    });

    return {
      imported: true,
      totalRows: parsed.totalRows,
      created,
      updated,
      errors: [],
    };
  }

  private buildListWhere(
    user: User,
    query: ListExercisesQueryDto,
  ): Prisma.ExerciseWhereInput {
    const filters = this.buildQueryFilters(query);

    if (user.role === UserRole.TRAINER) {
      return {
        ...filters,
        approvalStatus: ExerciseApprovalStatus.APPROVED,
        operationalStatus: ExerciseOperationalStatus.ACTIVE,
      };
    }

    return filters;
  }

  private buildQueryFilters(query: ListExercisesQueryDto) {
    const where: Prisma.ExerciseWhereInput = {};

    if (query.approvalStatus) {
      where.approvalStatus = query.approvalStatus;
    }

    if (query.operationalStatus) {
      where.operationalStatus = query.operationalStatus;
    }

    if (query.primaryMuscleGroup) {
      where.primaryMuscleGroup = {
        contains: query.primaryMuscleGroup,
        mode: textSearchMode,
      };
    }

    if (query.goal) {
      where.goals = { has: query.goal };
    }

    if (query.equipmentNeeded) {
      where.equipmentNeeded = {
        contains: query.equipmentNeeded,
        mode: textSearchMode,
      };
    }

    if (query.movementPattern) {
      where.movementPattern = {
        contains: query.movementPattern,
        mode: textSearchMode,
      };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: textSearchMode } },
        { description: { contains: query.search, mode: textSearchMode } },
      ];
    }

    return where;
  }

  private buildCreateData(
    dto: CreateExerciseDto,
  ): Omit<
    Prisma.ExerciseUncheckedCreateInput,
    | 'createdByUserId'
    | 'approvalStatus'
    | 'operationalStatus'
    | 'reviewedByUserId'
    | 'reviewedAt'
  > {
    return {
      name: dto.name.trim(),
      description: dto.description.trim(),
      primaryMuscleGroup: dto.primaryMuscleGroup.trim(),
      secondaryMuscleGroups: this.normalizeTextList(dto.secondaryMuscleGroups),
      movementPattern: dto.movementPattern.trim(),
      equipmentNeeded: dto.equipmentNeeded.trim(),
      equipmentType: this.normalizeEquipmentType(dto.equipmentType),
      goals: this.normalizeEnumList(dto.goals),
      technicalInstructions: dto.technicalInstructions.trim(),
      commonMistakes: this.normalizeOptionalText(dto.commonMistakes),
      contraindications: this.normalizeOptionalText(dto.contraindications),
      videoUrl: this.normalizeOptionalText(dto.videoUrl),
      imageUrl: this.normalizeOptionalText(dto.imageUrl),
    };
  }

  private buildUpdateData(
    dto: UpdateExerciseDto,
  ): Prisma.ExerciseUncheckedUpdateInput {
    const data: Prisma.ExerciseUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.primaryMuscleGroup !== undefined) {
      data.primaryMuscleGroup = dto.primaryMuscleGroup.trim();
    }
    if (dto.secondaryMuscleGroups !== undefined) {
      data.secondaryMuscleGroups = this.normalizeTextList(
        dto.secondaryMuscleGroups,
      );
    }
    if (dto.movementPattern !== undefined) {
      data.movementPattern = dto.movementPattern.trim();
    }
    if (dto.equipmentNeeded !== undefined) {
      data.equipmentNeeded = dto.equipmentNeeded.trim();
    }
    if (dto.equipmentType !== undefined) {
      data.equipmentType = this.normalizeEquipmentType(dto.equipmentType);
    }
    if (dto.goals !== undefined) data.goals = this.normalizeEnumList(dto.goals);
    if (dto.technicalInstructions !== undefined) {
      data.technicalInstructions = dto.technicalInstructions.trim();
    }
    if (dto.commonMistakes !== undefined) {
      data.commonMistakes = this.normalizeOptionalText(dto.commonMistakes);
    }
    if (dto.contraindications !== undefined) {
      data.contraindications = this.normalizeOptionalText(
        dto.contraindications,
      );
    }
    if (dto.videoUrl !== undefined) {
      data.videoUrl = this.normalizeOptionalText(dto.videoUrl);
    }
    if (dto.imageUrl !== undefined) {
      data.imageUrl = this.normalizeOptionalText(dto.imageUrl);
    }

    return data;
  }

  private async findVisibleExercise(user: User, exerciseId: string) {
    const exercise = await this.findExercise(exerciseId);

    if (user.role === UserRole.ADMIN) {
      return exercise;
    }

    const isPublicCatalogExercise =
      exercise.approvalStatus === ExerciseApprovalStatus.APPROVED &&
      exercise.operationalStatus === ExerciseOperationalStatus.ACTIVE;
    const isOwnProposal = exercise.createdByUserId === user.id;

    if (!isPublicCatalogExercise && !isOwnProposal) {
      throw new NotFoundException('Exercise not found.');
    }

    return exercise;
  }

  private async findExercise(exerciseId: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found.');
    }

    return exercise;
  }

  private assertAdmin(user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role is required.');
    }
  }

  private assertCanUpdateExercise(
    user: User,
    exercise: {
      createdByUserId: string;
      approvalStatus: ExerciseApprovalStatus;
    },
  ) {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    const isOwnProposal = exercise.createdByUserId === user.id;
    const isPending =
      exercise.approvalStatus === ExerciseApprovalStatus.PENDING;

    if (!isOwnProposal || !isPending) {
      throw new ForbiddenException(
        'Only pending own proposals can be updated.',
      );
    }
  }

  private isExcelFile(file: UploadedExerciseFile) {
    const name = file.originalname.toLowerCase();
    return (
      name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')
    );
  }

  private parseExerciseWorkbook(buffer: Buffer): {
    totalRows: number;
    rows: ParsedImportRow[];
    errors: ImportRowError[];
  } {
    let workbook: XLSX.WorkBook;

    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException('The uploaded file could not be read.');
    }

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new BadRequestException('The uploaded file has no sheets.');
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });
    const [headerRow, ...bodyRows] = rawRows;

    if (!headerRow?.length) {
      throw new BadRequestException('The uploaded file has no header row.');
    }

    const headerMap = this.buildImportHeaderMap(headerRow);
    const rows: ParsedImportRow[] = [];
    const errors: ImportRowError[] = [];
    const seenNames = new Set<string>();

    const missingRequiredHeaders = this.requiredImportFields().filter(
      (field) => headerMap[field] === undefined,
    );

    if (missingRequiredHeaders.length) {
      errors.push({
        row: 1,
        errors: missingRequiredHeaders.map(
          (field) => `Missing required column: ${field}.`,
        ),
      });
    }

    const nonEmptyRows = bodyRows.filter((row) =>
      row.some((cell) => this.importCellToString(cell).trim()),
    );

    if (nonEmptyRows.length > maxImportRows) {
      errors.push({
        row: 1,
        errors: [`The import supports up to ${maxImportRows} rows per file.`],
      });
    }

    for (const [index, rawRow] of bodyRows.entries()) {
      const sourceRow = index + 2;
      if (!rawRow.some((cell) => this.importCellToString(cell).trim())) {
        continue;
      }

      const parsedRow = this.parseExerciseImportRow(
        rawRow,
        headerMap,
        sourceRow,
      );
      const rowErrors = this.validateExerciseImportRow(parsedRow);
      const normalizedName = parsedRow.name.trim().toLowerCase();

      if (normalizedName) {
        if (seenNames.has(normalizedName)) {
          rowErrors.push('Duplicated exercise name in this file.');
        }
        seenNames.add(normalizedName);
      }

      if (rowErrors.length) {
        errors.push({ row: sourceRow, errors: rowErrors });
      } else {
        rows.push(parsedRow);
      }
    }

    if (!rows.length && !errors.length) {
      errors.push({
        row: 1,
        errors: ['The uploaded file has no exercise rows.'],
      });
    }

    return { totalRows: nonEmptyRows.length, rows, errors };
  }

  private buildImportHeaderMap(headerRow: unknown[]) {
    const aliases = this.importColumnAliases();
    const headerMap: Partial<Record<ImportableExerciseField, number>> = {};

    headerRow.forEach((header, index) => {
      const field = aliases.get(this.normalizeImportHeader(header));
      if (field && headerMap[field] === undefined) {
        headerMap[field] = index;
      }
    });

    return headerMap;
  }

  private parseExerciseImportRow(
    rawRow: unknown[],
    headerMap: Partial<Record<ImportableExerciseField, number>>,
    sourceRow: number,
  ): ParsedImportRow {
    const cell = (field: ImportableExerciseField) => {
      const index = headerMap[field];
      return index === undefined
        ? ''
        : this.importCellToString(rawRow[index]).trim();
    };

    return {
      sourceRow,
      name: cell('name'),
      description: cell('description'),
      primaryMuscleGroup: cell('primaryMuscleGroup'),
      secondaryMuscleGroups: this.parseImportList(
        cell('secondaryMuscleGroups'),
      ),
      movementPattern: cell('movementPattern'),
      equipmentNeeded: cell('equipmentNeeded'),
      equipmentType: cell('equipmentType') || undefined,
      goals: this.parseImportGoals(cell('goals')),
      technicalInstructions: cell('technicalInstructions'),
      commonMistakes: cell('commonMistakes') || undefined,
      contraindications: cell('contraindications') || undefined,
      videoUrl: cell('videoUrl') || undefined,
      imageUrl: cell('imageUrl') || undefined,
    };
  }

  private validateExerciseImportRow(row: ParsedImportRow) {
    const errors: string[] = [];

    this.requireImportText(errors, row.name, 'name', 120);
    this.requireImportText(errors, row.description, 'description', 1200);
    this.requireImportText(
      errors,
      row.primaryMuscleGroup,
      'primaryMuscleGroup',
      80,
    );
    this.requireImportText(errors, row.movementPattern, 'movementPattern', 80);
    this.requireImportText(errors, row.equipmentNeeded, 'equipmentNeeded', 120);
    this.requireImportText(
      errors,
      row.technicalInstructions,
      'technicalInstructions',
      1600,
    );

    if (!row.goals.length) {
      errors.push('goals must include at least one valid value.');
    }

    if (row.secondaryMuscleGroups?.some((value) => value.length > 80)) {
      errors.push(
        'secondaryMuscleGroups items must be 80 characters or fewer.',
      );
    }

    this.validateOptionalImportText(
      errors,
      row.commonMistakes,
      'commonMistakes',
      1200,
    );
    this.validateOptionalImportText(
      errors,
      row.contraindications,
      'contraindications',
      1200,
    );
    this.validateOptionalImportUrl(errors, row.videoUrl, 'videoUrl');
    this.validateOptionalImportUrl(errors, row.imageUrl, 'imageUrl');

    return errors;
  }

  private requireImportText(
    errors: string[],
    value: string | undefined,
    field: string,
    maxLength: number,
  ) {
    if (!value?.trim()) {
      errors.push(`${field} is required.`);
      return;
    }

    if (value.length > maxLength) {
      errors.push(`${field} must be ${maxLength} characters or fewer.`);
    }
  }

  private validateOptionalImportText(
    errors: string[],
    value: string | undefined,
    field: string,
    maxLength: number,
  ) {
    if (value && value.length > maxLength) {
      errors.push(`${field} must be ${maxLength} characters or fewer.`);
    }
  }

  private validateOptionalImportUrl(
    errors: string[],
    value: string | undefined,
    field: string,
  ) {
    if (!value) {
      return;
    }

    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push(`${field} must be an http or https URL.`);
      }
    } catch {
      errors.push(`${field} must be a valid URL.`);
    }
  }

  private parseImportList(value: string) {
    return value
      .split(/[;,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private parseImportGoals(value: string): ExerciseGoal[] {
    const aliases = new Map<string, ExerciseGoal>([
      ['strength', ExerciseGoal.STRENGTH],
      ['fuerza', ExerciseGoal.STRENGTH],
      ['mobility', ExerciseGoal.MOBILITY],
      ['movilidad', ExerciseGoal.MOBILITY],
      ['endurance', ExerciseGoal.ENDURANCE],
      ['resistencia', ExerciseGoal.ENDURANCE],
      ['cardio', ExerciseGoal.ENDURANCE],
      ['power', ExerciseGoal.POWER],
      ['potencia', ExerciseGoal.POWER],
      ['core', ExerciseGoal.CORE],
    ]);

    const goals = this.parseImportList(value).map((goal) => {
      const normalized = this.normalizeImportHeader(goal);
      return (
        aliases.get(normalized) ??
        ExerciseGoal[goal.trim().toUpperCase() as keyof typeof ExerciseGoal]
      );
    });

    return this.normalizeEnumList(goals.filter(Boolean));
  }

  private requiredImportFields(): ImportableExerciseField[] {
    return [
      'name',
      'description',
      'primaryMuscleGroup',
      'movementPattern',
      'equipmentNeeded',
      'goals',
      'technicalInstructions',
    ];
  }

  private importColumnAliases() {
    const entries: Array<[string, ImportableExerciseField]> = [
      ['name', 'name'],
      ['nombre', 'name'],
      ['ejercicio', 'name'],
      ['exercise', 'name'],
      ['description', 'description'],
      ['descripcion', 'description'],
      ['primarymusclegroup', 'primaryMuscleGroup'],
      ['grupomuscularprincipal', 'primaryMuscleGroup'],
      ['grupoprincipal', 'primaryMuscleGroup'],
      ['musculoprincipal', 'primaryMuscleGroup'],
      ['secondarymusclegroups', 'secondaryMuscleGroups'],
      ['gruposmuscularessecundarios', 'secondaryMuscleGroups'],
      ['secundarios', 'secondaryMuscleGroups'],
      ['movementpattern', 'movementPattern'],
      ['patrondemovimiento', 'movementPattern'],
      ['patronmovimiento', 'movementPattern'],
      ['patron', 'movementPattern'],
      ['equipmentneeded', 'equipmentNeeded'],
      ['equipamiento', 'equipmentNeeded'],
      ['equipamientonecesario', 'equipmentNeeded'],
      ['equipmenttype', 'equipmentType'],
      ['tipoequipamiento', 'equipmentType'],
      ['goals', 'goals'],
      ['objetivos', 'goals'],
      ['objetivo', 'goals'],
      ['technicalinstructions', 'technicalInstructions'],
      ['instruccionestecnicas', 'technicalInstructions'],
      ['tecnica', 'technicalInstructions'],
      ['commonmistakes', 'commonMistakes'],
      ['errorescomunes', 'commonMistakes'],
      ['contraindications', 'contraindications'],
      ['contraindicaciones', 'contraindications'],
      ['videourl', 'videoUrl'],
      ['video', 'videoUrl'],
      ['urldevideo', 'videoUrl'],
      ['imageurl', 'imageUrl'],
      ['imagen', 'imageUrl'],
      ['urldeimagen', 'imageUrl'],
    ];

    return new Map(entries);
  }

  private importCellToString(value: unknown) {
    if (value === null || value === undefined) {
      return '';
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return '';
  }
  private normalizeImportHeader(value: unknown) {
    return this.importCellToString(value)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  private async groupApprovedActiveBy(
    field:
      | 'primary_muscle_group'
      | 'equipment_needed'
      | 'equipment_type'
      | 'movement_pattern',
  ) {
    const rows = await this.prisma.$queryRaw<CoverageCountRow[]>(
      Prisma.sql`
        SELECT ${Prisma.raw(field)}::text AS value, COUNT(*)::bigint AS count
        FROM exercises
        WHERE approval_status = 'APPROVED'
          AND operational_status = 'ACTIVE'
        GROUP BY ${Prisma.raw(field)}
        ORDER BY COUNT(*) DESC
      `,
    );

    return rows.map((row) =>
      this.toCoverageBucket(row.value, Number(row.count)),
    );
  }

  private normalizeTextList(values?: string[]) {
    return values?.map((value) => value.trim()).filter(Boolean) ?? [];
  }

  private normalizeEnumList<T extends string>(values: T[]) {
    return [...new Set(values)];
  }

  private async buildEnumArrayCoverage(expectedValues: string[]) {
    const rows = await this.prisma.$queryRaw<CoverageCountRow[]>(
      Prisma.sql`
        SELECT goal.value::text AS value, COUNT(*)::bigint AS count
        FROM exercises
        CROSS JOIN LATERAL unnest(goals) AS goal(value)
        WHERE approval_status = 'APPROVED'
          AND operational_status = 'ACTIVE'
        GROUP BY goal.value
      `,
    );
    const counts = new Map(rows.map((row) => [row.value, Number(row.count)]));

    return expectedValues.map((value) =>
      this.toCoverageBucket(value, counts.get(value) ?? 0),
    );
  }

  private toCoverageBucket(value: string, count: number) {
    return {
      value,
      count,
      status:
        count === 0 ? 'NO_COVERAGE' : count < 2 ? 'LOW_COVERAGE' : 'SUFFICIENT',
    };
  }

  private normalizeOptionalText(value?: string | null) {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
  }

  private normalizeEquipmentType(value?: string | null) {
    const normalized = value?.trim() || 'otro';
    const allowedValues = new Set([
      'libre',
      'maquina',
      'polea',
      'peso corporal',
      'banda',
      'otro',
    ]);

    return allowedValues.has(normalized) ? normalized : 'otro';
  }
}
