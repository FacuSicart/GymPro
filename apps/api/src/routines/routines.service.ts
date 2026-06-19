import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  ExerciseApprovalStatus,
  ExerciseOperationalStatus,
  PublicRoutineLinkStatus,
  Prisma,
  RoutineStatus,
  StudentHistoryEventType,
  User,
  UserRole,
} from '@prisma/client';
import { Environment } from '../config/env.validation';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { ListRoutinesQueryDto } from './dto/list-routines-query.dto';
import { TrainingDayDto } from './dto/training-day.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import {
  RoutineWithDetails,
  toPublicRoutine,
  toPublicRoutines,
  toPublicRoutineVersions,
} from './routine-presenter';

const routineInclude = {
  student: true,
  trainer: true,
  days: {
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  },
  versions: true,
} satisfies Prisma.RoutineInclude;

const publicLinkSelect = {
  id: true,
  routineId: true,
  token: true,
  status: true,
  createdByUserId: true,
  revokedByUserId: true,
  revokedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PublicRoutineLinkSelect;

@Injectable()
export class RoutinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService?: MailService,
    private readonly config?: ConfigService<Environment, true>,
  ) {}

  async listRoutines(user: User, query: ListRoutinesQueryDto) {
    const routines = await this.prisma.routine.findMany({
      where: this.buildListWhere(user, query),
      include: routineInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return toPublicRoutines(routines);
  }

  async getRoutine(user: User, routineId: string) {
    const routine = await this.findAccessibleRoutine(user, routineId);

    return toPublicRoutine(routine);
  }

  async createRoutine(user: User, dto: CreateRoutineDto) {
    this.assertTrainer(user);
    this.validateDateRange(dto.startDate, dto.endDate);
    this.validateStructure(dto.days ?? []);

    const student = await this.findTrainerStudent(user, dto.studentId);
    await this.assertOfficialExercises(dto.days ?? []);

    const routine = await this.prisma.$transaction(async (tx) => {
      const created = await tx.routine.create({
        data: {
          studentId: student.id,
          trainerId: user.id,
          tenantId: student.tenantId,
          name: dto.name.trim(),
          description: this.normalizeOptionalText(dto.description),
          goal: dto.goal ?? null,
          daysPerWeek: dto.daysPerWeek ?? null,
          startDate: this.optionalDate(dto.startDate),
          endDate: this.optionalDate(dto.endDate),
          days: {
            create: this.buildDaysCreate(dto.days ?? []),
          },
        },
        include: routineInclude,
      });

      await this.writeHistory(tx, {
        user,
        routineId: created.id,
        studentId: created.studentId,
        tenantId: created.tenantId,
        trainerId: created.trainerId,
        type: StudentHistoryEventType.ROUTINE_CREATED,
        summary: `Rutina creada: ${created.name}.`,
      });

      return created;
    });

    return toPublicRoutine(routine);
  }

  async updateRoutine(user: User, routineId: string, dto: UpdateRoutineDto) {
    const current = await this.findTrainerOwnedRoutine(user, routineId);
    this.assertEditable(current);
    this.validateDateRange(dto.startDate, dto.endDate);

    if (dto.studentId && dto.studentId !== current.studentId) {
      throw new BadRequestException('Routine student cannot be changed.');
    }

    if (dto.days !== undefined) {
      this.validateStructure(dto.days);
      await this.assertOfficialExercises(dto.days);
    }

    const routine = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.routine.update({
        where: { id: current.id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined
            ? { description: this.normalizeOptionalText(dto.description) }
            : {}),
          ...(dto.goal !== undefined ? { goal: dto.goal ?? null } : {}),
          ...(dto.daysPerWeek !== undefined
            ? { daysPerWeek: dto.daysPerWeek ?? null }
            : {}),
          ...(dto.startDate !== undefined
            ? { startDate: this.optionalDate(dto.startDate) }
            : {}),
          ...(dto.endDate !== undefined
            ? { endDate: this.optionalDate(dto.endDate) }
            : {}),
        },
      });

      if (dto.days !== undefined) {
        await tx.trainingDay.deleteMany({ where: { routineId: current.id } });
        for (const day of dto.days) {
          await tx.trainingDay.create({
            data: {
              routineId: current.id,
              name: day.name.trim(),
              order: day.order,
              exercises: {
                create: day.exercises.map((item) =>
                  this.buildRoutineExerciseCreate(item),
                ),
              },
            },
          });
        }
      }

      await this.writeHistory(tx, {
        user,
        routineId: current.id,
        studentId: current.studentId,
        tenantId: current.tenantId,
        trainerId: current.trainerId,
        type: StudentHistoryEventType.ROUTINE_UPDATED,
        summary: `Rutina modificada: ${updated.name}.`,
      });

      return tx.routine.findUniqueOrThrow({
        where: { id: current.id },
        include: routineInclude,
      });
    });

    return toPublicRoutine(routine);
  }

  async duplicateRoutine(user: User, routineId: string) {
    const source = await this.findTrainerOwnedRoutine(user, routineId);
    await this.assertOfficialExercises(this.daysFromRoutine(source));

    const routine = await this.prisma.$transaction(async (tx) => {
      const duplicated = await tx.routine.create({
        data: {
          studentId: source.studentId,
          trainerId: source.trainerId,
          tenantId: source.tenantId,
          name: `${source.name} (copia)`,
          description: source.description,
          goal: source.goal,
          daysPerWeek: source.daysPerWeek,
          startDate: source.startDate,
          endDate: source.endDate,
          status: RoutineStatus.DRAFT,
          days: {
            create: source.days.map((day) => ({
              name: day.name,
              order: day.order,
              exercises: {
                create: day.exercises.map((item) => ({
                  exerciseId: item.exerciseId,
                  order: item.order,
                  sets: item.sets,
                  repetitions: item.repetitions,
                  restSeconds: item.restSeconds,
                  intensity: item.intensity,
                  tempo: item.tempo,
                  rir: item.rir,
                  rpe: item.rpe,
                  observations: item.observations,
                })),
              },
            })),
          },
        },
        include: routineInclude,
      });

      await this.writeHistory(tx, {
        user,
        routineId: duplicated.id,
        studentId: duplicated.studentId,
        tenantId: duplicated.tenantId,
        trainerId: duplicated.trainerId,
        type: StudentHistoryEventType.ROUTINE_CREATED,
        summary: `Rutina duplicada: ${duplicated.name}.`,
      });

      return duplicated;
    });

    return toPublicRoutine(routine);
  }

  async deleteRoutine(user: User, routineId: string) {
    const current = await this.findTrainerOwnedRoutine(user, routineId);

    if (current.status !== RoutineStatus.DRAFT) {
      throw new BadRequestException('Only draft routines can be deleted.');
    }

    await this.prisma.routine.delete({
      where: { id: current.id },
    });

    return { deleted: true };
  }

  async publishRoutine(user: User, routineId: string) {
    const current = await this.findTrainerOwnedRoutine(user, routineId);

    if (current.status === RoutineStatus.ARCHIVED) {
      throw new BadRequestException('Archived routines cannot be published.');
    }

    this.assertPublishable(current);
    const nextVersion = current.version + 1;
    const snapshot = this.buildSnapshot(current, nextVersion);

    const routine = await this.prisma.$transaction(async (tx) => {
      await tx.routineVersion.create({
        data: {
          routineId: current.id,
          version: nextVersion,
          snapshot,
          createdByUserId: user.id,
        },
      });

      const updated = await tx.routine.update({
        where: { id: current.id },
        data: {
          status: RoutineStatus.ACTIVE,
          version: nextVersion,
          publishedAt: new Date(),
          archivedAt: null,
        },
        include: routineInclude,
      });

      await this.writeHistory(tx, {
        user,
        routineId: current.id,
        studentId: current.studentId,
        tenantId: current.tenantId,
        trainerId: current.trainerId,
        type: StudentHistoryEventType.ROUTINE_PUBLISHED,
        summary: `Rutina publicada: ${current.name} v${nextVersion}.`,
        metadata: { version: nextVersion },
      });

      return updated;
    });

    return toPublicRoutine(routine);
  }

  async archiveRoutine(user: User, routineId: string) {
    const current = await this.findTrainerOwnedRoutine(user, routineId);

    if (current.status === RoutineStatus.ARCHIVED) {
      return toPublicRoutine(current);
    }

    const routine = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.routine.update({
        where: { id: current.id },
        data: {
          status: RoutineStatus.ARCHIVED,
          archivedAt: new Date(),
        },
        include: routineInclude,
      });

      await this.writeHistory(tx, {
        user,
        routineId: current.id,
        studentId: current.studentId,
        tenantId: current.tenantId,
        trainerId: current.trainerId,
        type: StudentHistoryEventType.ROUTINE_ARCHIVED,
        summary: `Rutina archivada: ${current.name}.`,
      });

      return updated;
    });

    return toPublicRoutine(routine);
  }

  async listVersions(user: User, routineId: string) {
    const routine = await this.findAccessibleRoutine(user, routineId);
    const versions = await this.prisma.routineVersion.findMany({
      where: { routineId: routine.id },
      orderBy: { version: 'desc' },
    });

    return toPublicRoutineVersions(versions);
  }

  async getPublicLink(user: User, routineId: string) {
    const routine = await this.findAccessibleRoutine(user, routineId);
    const link = await this.prisma.publicRoutineLink.findFirst({
      where: { routineId: routine.id },
      orderBy: { createdAt: 'desc' },
      select: publicLinkSelect,
    });

    return link ? this.toPublicLinkResponse(link) : null;
  }

  async generatePublicLink(user: User, routineId: string) {
    const routine = await this.findTrainerOwnedRoutine(user, routineId);

    const link = await this.getOrCreateActivePublicLink(user, routine);
    return this.toPublicLinkResponse(link);
  }

  async sendPublicLinkEmail(user: User, routineId: string, email?: string) {
    const routine = await this.findTrainerOwnedRoutine(user, routineId);
    const link = await this.getOrCreateActivePublicLink(user, routine);
    const recipient = this.normalizeOptionalEmail(email) ?? routine.student.email;

    if (!recipient) {
      throw new BadRequestException('Student email is required.');
    }

    if (!this.mailService) {
      throw new BadRequestException('Transactional email is not configured.');
    }

    const publicUrl = this.buildPublicUrl(link.token);
    const trainerName = `${routine.trainer.firstName} ${routine.trainer.lastName}`.trim();
    await this.mailService.sendMail({
      to: recipient,
      fromName: `${trainerName} via Proyecto Gym`,
      replyTo: routine.trainer.email,
      subject: `Tu rutina: ${routine.name}`,
      text: [
        `Hola ${routine.student.firstName},`,
        '',
        `${trainerName} te compartio una rutina.`,
        '',
        `Abrila desde este enlace: ${publicUrl}`,
      ].join('\n'),
      html: [
        `<p>Hola ${this.escapeHtml(routine.student.firstName)},</p>`,
        `<p>${this.escapeHtml(trainerName)} te compartio una rutina.</p>`,
        `<p><a href="${publicUrl}">Abrir rutina</a></p>`,
        `<p>Si el boton no funciona, copia este enlace:<br>${publicUrl}</p>`,
      ].join(''),
    });

    return {
      sent: true,
      email: recipient,
      publicLink: this.toPublicLinkResponse(link),
    };
  }

  async revokePublicLink(user: User, routineId: string) {
    const routine = await this.findTrainerOwnedRoutine(user, routineId);
    const existing = await this.prisma.publicRoutineLink.findFirst({
      where: {
        routineId: routine.id,
        status: PublicRoutineLinkStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      select: publicLinkSelect,
    });

    if (!existing) {
      return null;
    }

    const link = await this.prisma.publicRoutineLink.update({
      where: { id: existing.id },
      data: {
        status: PublicRoutineLinkStatus.REVOKED,
        revokedAt: new Date(),
        revokedByUserId: user.id,
      },
      select: publicLinkSelect,
    });

    return this.toPublicLinkResponse(link);
  }

  async getPublicRoutineByToken(token: string) {
    const link = await this.prisma.publicRoutineLink.findUnique({
      where: { token },
      include: {
        routine: {
          include: {
            versions: {
              orderBy: { version: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Routine not found.');
    }

    if (link.status === PublicRoutineLinkStatus.REVOKED) {
      throw new ForbiddenException('This link is no longer available.');
    }

    const snapshot = link.routine.versions[0]?.snapshot;

    if (!snapshot) {
      throw new NotFoundException('Routine not found.');
    }

    return this.toPublicRoutineResponse(snapshot);
  }

  private buildListWhere(
    user: User,
    query: ListRoutinesQueryDto,
  ): Prisma.RoutineWhereInput {
    const where: Prisma.RoutineWhereInput = {};

    if (query.studentId) {
      where.studentId = query.studentId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (user.role === UserRole.TRAINER) {
      where.trainerId = user.id;
    }

    return where;
  }

  private async findAccessibleRoutine(user: User, routineId: string) {
    const routine = await this.prisma.routine.findFirst({
      where: {
        id: routineId,
        ...(user.role === UserRole.TRAINER ? { trainerId: user.id } : {}),
      },
      include: routineInclude,
    });

    if (!routine) {
      throw new NotFoundException('Routine not found.');
    }

    return routine;
  }

  private async findTrainerOwnedRoutine(user: User, routineId: string) {
    this.assertTrainer(user);

    const routine = await this.prisma.routine.findFirst({
      where: { id: routineId, trainerId: user.id },
      include: routineInclude,
    });

    if (!routine) {
      throw new NotFoundException('Routine not found.');
    }

    return routine;
  }

  private async findTrainerStudent(user: User, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        trainerId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    return student;
  }

  private assertTrainer(user: User) {
    if (user.role !== UserRole.TRAINER) {
      throw new ForbiddenException('Trainer role is required.');
    }
  }

  private assertEditable(routine: { status: RoutineStatus }) {
    if (routine.status === RoutineStatus.ARCHIVED) {
      throw new BadRequestException('Archived routines cannot be edited.');
    }
  }

  private assertPublishable(routine: RoutineWithDetails) {
    const exerciseCount = routine.days.reduce(
      (total, day) => total + day.exercises.length,
      0,
    );

    if (!routine.days.length || exerciseCount === 0) {
      throw new BadRequestException(
        'Routine must have at least one day and one exercise before publishing.',
      );
    }
  }

  private async assertOfficialExercises(days: TrainingDayDto[]) {
    const exerciseIds = [
      ...new Set(
        days.flatMap((day) => day.exercises.map((item) => item.exerciseId)),
      ),
    ];

    if (!exerciseIds.length) {
      return;
    }

    const officialExercises = await this.prisma.exercise.findMany({
      where: {
        id: { in: exerciseIds },
        approvalStatus: ExerciseApprovalStatus.APPROVED,
        operationalStatus: ExerciseOperationalStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (officialExercises.length !== exerciseIds.length) {
      throw new BadRequestException(
        'Routine can only use approved and active catalog exercises.',
      );
    }
  }

  private validateStructure(days: TrainingDayDto[]) {
    this.assertUniqueOrders(
      days.map((day) => day.order),
      'Day order must be unique.',
    );

    for (const day of days) {
      this.assertUniqueOrders(
        day.exercises.map((item) => item.order),
        `Exercise order must be unique in ${day.name}.`,
      );
    }
  }

  private assertUniqueOrders(orders: number[], message: string) {
    if (new Set(orders).size !== orders.length) {
      throw new BadRequestException(message);
    }
  }

  private validateDateRange(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date cannot be after end date.');
    }
  }

  private buildDaysCreate(days: TrainingDayDto[]) {
    return days.map((day) => ({
      name: day.name.trim(),
      order: day.order,
      exercises: {
        create: day.exercises.map((item) =>
          this.buildRoutineExerciseCreate(item),
        ),
      },
    }));
  }

  private buildRoutineExerciseCreate(item: {
    exerciseId: string;
    order: number;
    sets?: number;
    repetitions?: string;
    restSeconds?: number;
    intensity?: string;
    tempo?: string;
    rir?: number;
    rpe?: number;
    observations?: string;
  }) {
    return {
      exerciseId: item.exerciseId,
      order: item.order,
      sets: item.sets ?? null,
      repetitions: this.normalizeOptionalText(item.repetitions),
      restSeconds: item.restSeconds ?? null,
      intensity: this.normalizeOptionalText(item.intensity),
      tempo: this.normalizeOptionalText(item.tempo),
      rir: item.rir ?? null,
      rpe: item.rpe ?? null,
      observations: this.normalizeOptionalText(item.observations),
    };
  }

  private daysFromRoutine(routine: RoutineWithDetails): TrainingDayDto[] {
    return routine.days.map((day) => ({
      name: day.name,
      order: day.order,
      exercises: day.exercises.map((item) => ({
        exerciseId: item.exerciseId,
        order: item.order,
        sets: item.sets ?? undefined,
        repetitions: item.repetitions ?? undefined,
        restSeconds: item.restSeconds ?? undefined,
        intensity: item.intensity ?? undefined,
        tempo: item.tempo ?? undefined,
        rir: item.rir ?? undefined,
        rpe: item.rpe ?? undefined,
        observations: item.observations ?? undefined,
      })),
    }));
  }

  private buildSnapshot(routine: RoutineWithDetails, version: number) {
    return {
      routine: {
        id: routine.id,
        name: routine.name,
        description: routine.description,
        goal: routine.goal,
        daysPerWeek: routine.daysPerWeek,
        status: RoutineStatus.ACTIVE,
        version,
        startDate: routine.startDate,
        endDate: routine.endDate,
      },
      student: {
        id: routine.student.id,
        firstName: routine.student.firstName,
        lastName: routine.student.lastName,
      },
      trainer: {
        firstName: routine.trainer.firstName,
        lastName: routine.trainer.lastName,
      },
      days: routine.days
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((day) => ({
          id: day.id,
          name: day.name,
          order: day.order,
          exercises: day.exercises
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((item) => ({
              id: item.id,
              exerciseId: item.exerciseId,
              order: item.order,
              sets: item.sets,
              repetitions: item.repetitions,
              restSeconds: item.restSeconds,
              intensity: item.intensity,
              tempo: item.tempo,
              rir: item.rir,
              rpe: item.rpe,
              observations: item.observations,
              exercise: {
                name: item.exercise.name,
                description: item.exercise.description,
                primaryMuscleGroup: item.exercise.primaryMuscleGroup,
                secondaryMuscleGroups: item.exercise.secondaryMuscleGroups,
                movementPattern: item.exercise.movementPattern,
                equipmentNeeded: item.exercise.equipmentNeeded,
                equipmentType: item.exercise.equipmentType,
                technicalInstructions: item.exercise.technicalInstructions,
                commonMistakes: item.exercise.commonMistakes,
                contraindications: item.exercise.contraindications,
                videoUrl: item.exercise.videoUrl,
                imageUrl: item.exercise.imageUrl,
              },
            })),
        })),
      createdAt: new Date().toISOString(),
    };
  }

  private writeHistory(
    tx: Prisma.TransactionClient,
    input: {
      user: User;
      routineId: string;
      studentId: string;
      tenantId: string;
      trainerId: string;
      type: StudentHistoryEventType;
      summary: string;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    return tx.studentHistoryEvent.create({
      data: {
        studentId: input.studentId,
        tenantId: input.tenantId,
        trainerId: input.trainerId,
        createdByUserId: input.user.id,
        type: input.type,
        summary: input.summary,
        metadata: {
          source: 'routines',
          routineId: input.routineId,
          ...(typeof input.metadata === 'object' && input.metadata
            ? input.metadata
            : {}),
        },
      },
    });
  }

  private optionalDate(value?: string | null) {
    return value ? new Date(value) : null;
  }

  private normalizeOptionalText(value?: string | null) {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
  }

  private normalizeOptionalEmail(value?: string | null) {
    const trimmed = value?.trim().toLowerCase();

    return trimmed ? trimmed : null;
  }

  private async getOrCreateActivePublicLink(user: User, routine: RoutineWithDetails) {
    if (routine.status !== RoutineStatus.ACTIVE) {
      throw new BadRequestException(
        'Only active routines can have a public link.',
      );
    }

    if (!routine.versions.length) {
      throw new BadRequestException(
        'Routine must have a published snapshot before sharing.',
      );
    }

    const existing = await this.prisma.publicRoutineLink.findFirst({
      where: {
        routineId: routine.id,
        status: PublicRoutineLinkStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      select: publicLinkSelect,
    });

    if (existing) {
      return existing;
    }

    return this.prisma.publicRoutineLink.create({
      data: {
        routineId: routine.id,
        token: this.generateToken(),
        createdByUserId: user.id,
      },
      select: publicLinkSelect,
    });
  }

  private buildPublicUrl(token: string) {
    const origin = this.config?.get('WEB_ORIGIN') ?? 'http://localhost:3000';

    return `${origin.replace(/\/$/, '')}/r/${token}`;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private generateToken() {
    return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  }

  private toPublicLinkResponse(link: {
    id: string;
    routineId: string;
    token: string;
    status: PublicRoutineLinkStatus;
    createdByUserId: string;
    revokedByUserId: string | null;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: link.id,
      routineId: link.routineId,
      token: link.token,
      status: link.status,
      createdByUserId: link.createdByUserId,
      revokedByUserId: link.revokedByUserId,
      revokedAt: link.revokedAt,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }

  private toPublicRoutineResponse(snapshot: Prisma.JsonValue) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      throw new NotFoundException('Routine not found.');
    }

    const data = snapshot as Record<string, unknown>;
    const routine = this.asRecord(data.routine);
    const student = this.asRecord(data.student);
    const trainer = this.asRecord(data.trainer);
    const days = Array.isArray(data.days) ? data.days : [];

    return {
      routine: {
        name: routine.name,
        description: routine.description,
        goal: routine.goal,
        daysPerWeek: routine.daysPerWeek,
        version: routine.version,
        startDate: routine.startDate,
        endDate: routine.endDate,
      },
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
      },
      trainer: {
        firstName: trainer.firstName,
        lastName: trainer.lastName,
      },
      days: days.map((rawDay) => {
        const day = this.asRecord(rawDay);
        const exercises = Array.isArray(day.exercises) ? day.exercises : [];

        return {
          name: day.name,
          order: day.order,
          exercises: exercises.map((rawItem) => {
            const item = this.asRecord(rawItem);
            const exercise = this.asRecord(item.exercise);

            return {
              order: item.order,
              sets: item.sets,
              repetitions: item.repetitions,
              restSeconds: item.restSeconds,
              intensity: item.intensity,
              tempo: item.tempo,
              rir: item.rir,
              rpe: item.rpe,
              observations: item.observations,
              exercise: {
                name: exercise.name,
                description: exercise.description,
                primaryMuscleGroup: exercise.primaryMuscleGroup,
                movementPattern: exercise.movementPattern,
                equipmentNeeded: exercise.equipmentNeeded,
                equipmentType: exercise.equipmentType,
                technicalInstructions: exercise.technicalInstructions,
                commonMistakes: exercise.commonMistakes,
                contraindications: exercise.contraindications,
                videoUrl: exercise.videoUrl,
                imageUrl: exercise.imageUrl,
              },
            };
          }),
        };
      }),
    };
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
}
