import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
const expectedExerciseGoals = ['STRENGTH', 'MOBILITY', 'ENDURANCE', 'POWER', 'CORE'];

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

    const [
      muscleGroups,
      goals,
      equipment,
      equipmentTypes,
      movementPatterns,
    ] = await Promise.all([
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

    return rows.map((row) => this.toCoverageBucket(row.value, Number(row.count)));
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
        count === 0
          ? 'NO_COVERAGE'
          : count < 2
            ? 'LOW_COVERAGE'
            : 'SUFFICIENT',
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
