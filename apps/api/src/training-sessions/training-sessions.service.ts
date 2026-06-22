import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  PublicRoutineLinkStatus,
  RoutineStatus,
  StudentHistoryEventType,
  TrainingSessionStatus,
  User,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { paginationArgs } from '../common/pagination-query.dto';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { ListTrainingSessionsQueryDto } from './dto/list-training-sessions-query.dto';
import { UpdateTrainingSessionExerciseDto } from './dto/update-training-session-exercise.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import {
  toPublicLinkExercise,
  toPublicLinkTrainingSession,
  toPublicTrainingSession,
  toPublicTrainingSessionExercise,
  toPublicTrainingSessions,
} from './training-session-presenter';

const trainingSessionInclude = {
  student: true,
  trainer: true,
  routine: true,
  routineVersion: true,
  days: {
    include: {
      exercises: true,
    },
  },
} satisfies Prisma.TrainingSessionInclude;

const trainingSessionForLinkInclude = {
  days: {
    include: {
      exercises: true,
    },
  },
} satisfies Prisma.TrainingSessionInclude;

type TrainingSessionForLinkRecord = Prisma.TrainingSessionGetPayload<{
  include: typeof trainingSessionForLinkInclude;
}>;

@Injectable()
export class TrainingSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSessions(user: User, query: ListTrainingSessionsQueryDto) {
    const sessions = await this.prisma.trainingSession.findMany({
      where: this.buildListWhere(user, query),
      include: trainingSessionInclude,
      orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
      ...paginationArgs(query),
    });

    return toPublicTrainingSessions(sessions);
  }

  async getSession(user: User, sessionId: string) {
    const session = await this.findAccessibleSession(user, sessionId);

    return toPublicTrainingSession(session);
  }

  async listByStudent(user: User, studentId: string) {
    const student = await this.findAccessibleStudent(user, studentId);

    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        studentId: student.id,
        ...(user.role === UserRole.TRAINER ? { trainerId: user.id } : {}),
      },
      include: trainingSessionInclude,
      orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
      ...paginationArgs(),
    });

    return toPublicTrainingSessions(sessions);
  }

  async createSession(user: User, dto: CreateTrainingSessionDto) {
    this.assertTrainer(user);

    const routine = await this.prisma.routine.findFirst({
      where: { id: dto.routineId, trainerId: user.id },
      include: {
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!routine) {
      throw new NotFoundException('Routine not found.');
    }

    if (routine.status === RoutineStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot create a session from a draft routine.',
      );
    }

    if (routine.status === RoutineStatus.ARCHIVED) {
      throw new BadRequestException(
        'Cannot create a session from an archived routine.',
      );
    }

    const version = routine.versions[0];

    if (!version) {
      throw new BadRequestException(
        'Routine has no published snapshot yet.',
      );
    }

    const days = this.buildDaysFromSnapshot(version.snapshot);

    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.trainingSession.create({
        data: {
          tenantId: routine.tenantId,
          studentId: routine.studentId,
          trainerId: routine.trainerId,
          routineId: routine.id,
          routineVersionId: version.id,
          scheduledDate: this.optionalDate(dto.scheduledDate),
          notes: this.normalizeOptionalText(dto.notes),
          days: {
            create: days,
          },
        },
        include: trainingSessionInclude,
      });

      await this.writeHistory(tx, {
        createdByUserId: user.id,
        trainingSessionId: created.id,
        studentId: created.studentId,
        tenantId: created.tenantId,
        trainerId: created.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_CREATED,
        summary: `Sesión de entrenamiento creada desde: ${routine.name}.`,
      });

      return created;
    });

    return toPublicTrainingSession(session);
  }

  async updateSession(
    user: User,
    sessionId: string,
    dto: UpdateTrainingSessionDto,
  ) {
    const current = await this.findTrainerOwnedSession(user, sessionId);
    this.assertOpen(current);

    const updated = await this.prisma.trainingSession.update({
      where: { id: current.id },
      data: {
        ...(dto.scheduledDate !== undefined
          ? { scheduledDate: this.optionalDate(dto.scheduledDate) }
          : {}),
        ...(dto.notes !== undefined
          ? { notes: this.normalizeOptionalText(dto.notes) }
          : {}),
      },
      include: trainingSessionInclude,
    });

    return toPublicTrainingSession(updated);
  }

  async startSession(user: User, sessionId: string) {
    const current = await this.findTrainerOwnedSession(user, sessionId);

    if (current.status !== TrainingSessionStatus.PLANNED) {
      throw new BadRequestException('Only planned sessions can be started.');
    }

    const session = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.trainingSession.update({
        where: { id: current.id },
        data: {
          status: TrainingSessionStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
        include: trainingSessionInclude,
      });

      await this.writeHistory(tx, {
        createdByUserId: user.id,
        trainingSessionId: current.id,
        studentId: current.studentId,
        tenantId: current.tenantId,
        trainerId: current.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_STARTED,
        summary: `Sesión de entrenamiento iniciada: ${current.routine.name}.`,
      });

      return updated;
    });

    return toPublicTrainingSession(session);
  }

  async completeSession(user: User, sessionId: string) {
    const current = await this.findTrainerOwnedSession(user, sessionId);

    if (
      current.status !== TrainingSessionStatus.PLANNED &&
      current.status !== TrainingSessionStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'Only planned or in-progress sessions can be completed.',
      );
    }

    const session = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.trainingSession.update({
        where: { id: current.id },
        data: {
          status: TrainingSessionStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: trainingSessionInclude,
      });

      await this.writeHistory(tx, {
        createdByUserId: user.id,
        trainingSessionId: current.id,
        studentId: current.studentId,
        tenantId: current.tenantId,
        trainerId: current.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_COMPLETED,
        summary: `Sesión de entrenamiento completada: ${current.routine.name}.`,
      });

      return updated;
    });

    return toPublicTrainingSession(session);
  }

  async cancelSession(user: User, sessionId: string) {
    const current = await this.findTrainerOwnedSession(user, sessionId);

    if (
      current.status !== TrainingSessionStatus.PLANNED &&
      current.status !== TrainingSessionStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'Only planned or in-progress sessions can be cancelled.',
      );
    }

    const session = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.trainingSession.update({
        where: { id: current.id },
        data: {
          status: TrainingSessionStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: trainingSessionInclude,
      });

      await this.writeHistory(tx, {
        createdByUserId: user.id,
        trainingSessionId: current.id,
        studentId: current.studentId,
        tenantId: current.tenantId,
        trainerId: current.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_CANCELLED,
        summary: `Sesión de entrenamiento cancelada: ${current.routine.name}.`,
      });

      return updated;
    });

    return toPublicTrainingSession(session);
  }

  async updateSessionExercise(
    user: User,
    exerciseId: string,
    dto: UpdateTrainingSessionExerciseDto,
  ) {
    this.assertTrainer(user);

    const exercise = await this.prisma.trainingSessionExercise.findFirst({
      where: {
        id: exerciseId,
        trainingSessionDay: { trainingSession: { trainerId: user.id } },
      },
      include: {
        trainingSessionDay: { include: { trainingSession: true } },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found.');
    }

    const session = exercise.trainingSessionDay.trainingSession;
    this.assertOpen(session);
    this.assertDayOpen(exercise.trainingSessionDay);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.trainingSessionExercise.update({
        where: { id: exercise.id },
        data: this.buildExerciseUpdateData(dto),
        include: { trainingSessionDay: { include: { trainingSession: true } } },
      });

      await this.writeHistory(tx, {
        createdByUserId: user.id,
        trainingSessionId: session.id,
        trainingSessionDayId: exercise.trainingSessionDayId,
        studentId: session.studentId,
        tenantId: session.tenantId,
        trainerId: session.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_EXERCISE_UPDATED,
        summary: `Ejercicio registrado (${exercise.trainingSessionDay.name}): ${exercise.exerciseName}.`,
      });

      return result;
    });

    return toPublicTrainingSessionExercise(updated);
  }

  async startPublicSession(token: string) {
    const { routine } = await this.findActivePublicLink(token);

    if (routine.status !== RoutineStatus.ACTIVE) {
      throw new BadRequestException('Routine is not active.');
    }

    const version = routine.versions[0];

    if (!version) {
      throw new BadRequestException('Routine has no published snapshot yet.');
    }

    const existing = await this.prisma.trainingSession.findFirst({
      where: {
        routineId: routine.id,
        status: { in: [TrainingSessionStatus.IN_PROGRESS, TrainingSessionStatus.COMPLETED] },
      },
      orderBy: { createdAt: 'desc' },
      include: trainingSessionForLinkInclude,
    });

    if (existing?.routineVersionId === version.id) {
      if (existing.status === TrainingSessionStatus.IN_PROGRESS) {
        return toPublicLinkTrainingSession(existing);
      }
    }

    if (existing && existing.routineVersionId !== version.id) {
      const session = await this.syncPublicSessionToLatestVersion(existing, version.id, version.snapshot);

      return toPublicLinkTrainingSession(session);
    }

    const days = this.buildDaysFromSnapshot(version.snapshot);

    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.trainingSession.create({
        data: {
          tenantId: routine.tenantId,
          studentId: routine.studentId,
          trainerId: routine.trainerId,
          routineId: routine.id,
          routineVersionId: version.id,
          status: TrainingSessionStatus.IN_PROGRESS,
          startedAt: new Date(),
          days: {
            create: days,
          },
        },
        include: trainingSessionForLinkInclude,
      });

      await this.writeHistory(tx, {
        createdByUserId: routine.trainerId,
        trainingSessionId: created.id,
        studentId: created.studentId,
        tenantId: created.tenantId,
        trainerId: created.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_CREATED,
        summary: `Sesión de entrenamiento creada por el alumno desde: ${routine.name}.`,
        source: 'public-link',
      });

      await this.writeHistory(tx, {
        createdByUserId: routine.trainerId,
        trainingSessionId: created.id,
        studentId: created.studentId,
        tenantId: created.tenantId,
        trainerId: created.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_STARTED,
        summary: `Sesión de entrenamiento iniciada por el alumno: ${routine.name}.`,
        source: 'public-link',
      });

      return created;
    });

    return toPublicLinkTrainingSession(session);
  }

  private async syncPublicSessionToLatestVersion(
    session: TrainingSessionForLinkRecord,
    routineVersionId: string,
    snapshot: Prisma.JsonValue,
  ) {
    const latestDays = this.buildDaysFromSnapshot(snapshot);
    const completedOrders = new Set(
      session.days
        .filter((day) => day.completedAt !== null)
        .map((day) => day.order),
    );
    const pendingDays = latestDays.filter((day) => !completedOrders.has(day.order));

    return this.prisma.$transaction(async (tx) => {
      await tx.trainingSession.update({
        where: { id: session.id },
        data: {
          routineVersionId,
          status: TrainingSessionStatus.IN_PROGRESS,
          completedAt: null,
          cancelledAt: null,
        },
      });

      await tx.trainingSessionDay.deleteMany({
        where: {
          trainingSessionId: session.id,
          completedAt: null,
        },
      });

      for (const day of pendingDays) {
        await tx.trainingSessionDay.create({
          data: {
            trainingSessionId: session.id,
            ...day,
          },
        });
      }

      return tx.trainingSession.findUniqueOrThrow({
        where: { id: session.id },
        include: trainingSessionForLinkInclude,
      });
    });
  }

  async getPublicSession(token: string) {
    const { routine } = await this.findActivePublicLink(token);

    const session = await this.prisma.trainingSession.findFirst({
      where: { routineId: routine.id, status: TrainingSessionStatus.IN_PROGRESS },
      orderBy: { createdAt: 'desc' },
      include: trainingSessionForLinkInclude,
    });

    return session ? toPublicLinkTrainingSession(session) : null;
  }

  async completePublicSessionDay(token: string, dayId: string) {
    const { routine } = await this.findActivePublicLink(token);

    const day = await this.prisma.trainingSessionDay.findFirst({
      where: {
        id: dayId,
        trainingSession: { routineId: routine.id, status: TrainingSessionStatus.IN_PROGRESS },
      },
      include: { trainingSession: { include: { days: true } } },
    });

    if (!day) {
      throw new NotFoundException('Training day not found.');
    }

    const session = day.trainingSession;
    const otherDaysCompleted = session.days
      .filter((d) => d.id !== day.id)
      .every((d) => d.completedAt !== null);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.trainingSessionDay.update({
        where: { id: day.id },
        data: { completedAt: new Date() },
      });

      await this.writeHistory(tx, {
        createdByUserId: session.trainerId,
        trainingSessionId: session.id,
        trainingSessionDayId: day.id,
        studentId: session.studentId,
        tenantId: session.tenantId,
        trainerId: session.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_DAY_COMPLETED,
        summary: `Día completado por el alumno (${day.name}): ${routine.name}.`,
        source: 'public-link',
      });

      if (otherDaysCompleted) {
        await tx.trainingSession.update({
          where: { id: session.id },
          data: {
            status: TrainingSessionStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        await this.writeHistory(tx, {
          createdByUserId: session.trainerId,
          trainingSessionId: session.id,
          studentId: session.studentId,
          tenantId: session.tenantId,
          trainerId: session.trainerId,
          type: StudentHistoryEventType.TRAINING_SESSION_COMPLETED,
          summary: `Sesión de entrenamiento completada por el alumno: ${routine.name}.`,
          source: 'public-link',
        });
      }

      return tx.trainingSession.findUniqueOrThrow({
        where: { id: session.id },
        include: trainingSessionForLinkInclude,
      });
    });

    return toPublicLinkTrainingSession(updated);
  }

  async updatePublicSessionExercise(
    token: string,
    exerciseId: string,
    dto: UpdateTrainingSessionExerciseDto,
  ) {
    const { routine } = await this.findActivePublicLink(token);

    const exercise = await this.prisma.trainingSessionExercise.findFirst({
      where: {
        id: exerciseId,
        trainingSessionDay: { trainingSession: { routineId: routine.id } },
      },
      include: {
        trainingSessionDay: { include: { trainingSession: true } },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found.');
    }

    const session = exercise.trainingSessionDay.trainingSession;

    if (session.status !== TrainingSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress.');
    }

    this.assertDayOpen(exercise.trainingSessionDay);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.trainingSessionExercise.update({
        where: { id: exercise.id },
        data: this.buildExerciseUpdateData(dto),
      });

      await this.writeHistory(tx, {
        createdByUserId: session.trainerId,
        trainingSessionId: session.id,
        trainingSessionDayId: exercise.trainingSessionDayId,
        studentId: session.studentId,
        tenantId: session.tenantId,
        trainerId: session.trainerId,
        type: StudentHistoryEventType.TRAINING_SESSION_EXERCISE_UPDATED,
        summary: `Ejercicio registrado por el alumno (${exercise.trainingSessionDay.name}): ${exercise.exerciseName}.`,
        source: 'public-link',
      });

      return result;
    });

    return toPublicLinkExercise(updated);
  }

  private async findActivePublicLink(token: string) {
    const link = await this.prisma.publicRoutineLink.findUnique({
      where: { token },
      include: {
        routine: {
          include: {
            versions: { orderBy: { version: 'desc' }, take: 1 },
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

    return { link, routine: link.routine };
  }

  private buildListWhere(
    user: User,
    query: ListTrainingSessionsQueryDto,
  ): Prisma.TrainingSessionWhereInput {
    const where: Prisma.TrainingSessionWhereInput = {};

    if (query.studentId) {
      where.studentId = query.studentId;
    }

    if (query.routineId) {
      where.routineId = query.routineId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (user.role === UserRole.TRAINER) {
      where.trainerId = user.id;
    }

    return where;
  }

  private async findAccessibleSession(user: User, sessionId: string) {
    const session = await this.prisma.trainingSession.findFirst({
      where: {
        id: sessionId,
        ...(user.role === UserRole.TRAINER ? { trainerId: user.id } : {}),
      },
      include: trainingSessionInclude,
    });

    if (!session) {
      throw new NotFoundException('Training session not found.');
    }

    return session;
  }

  private async findTrainerOwnedSession(user: User, sessionId: string) {
    this.assertTrainer(user);

    const session = await this.prisma.trainingSession.findFirst({
      where: { id: sessionId, trainerId: user.id },
      include: trainingSessionInclude,
    });

    if (!session) {
      throw new NotFoundException('Training session not found.');
    }

    return session;
  }

  private async findAccessibleStudent(user: User, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        ...(user.role === UserRole.TRAINER ? { trainerId: user.id } : {}),
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

  private assertOpen(session: { status: TrainingSessionStatus }) {
    if (
      session.status === TrainingSessionStatus.COMPLETED ||
      session.status === TrainingSessionStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot edit a completed or cancelled session.',
      );
    }
  }

  private assertDayOpen(day: { completedAt?: Date | null }) {
    if (day.completedAt != null) {
      throw new BadRequestException('Completed training days cannot be edited.');
    }
  }

  private buildExerciseUpdateData(
    dto: UpdateTrainingSessionExerciseDto,
  ): Prisma.TrainingSessionExerciseUncheckedUpdateInput {
    const data: Prisma.TrainingSessionExerciseUncheckedUpdateInput = {};

    if (dto.completed !== undefined) {
      data.completed = dto.completed;
    }

    if (dto.actualSets !== undefined) {
      data.actualSets = dto.actualSets;
    }

    if (dto.actualRepetitions !== undefined) {
      data.actualRepetitions = this.normalizeOptionalText(
        dto.actualRepetitions,
      );
    }

    if (dto.actualLoad !== undefined) {
      data.actualLoad = this.normalizeOptionalText(dto.actualLoad);
    }

    if (dto.actualRestSeconds !== undefined) {
      data.actualRestSeconds = dto.actualRestSeconds;
    }

    if (dto.actualRir !== undefined) {
      data.actualRir = dto.actualRir;
    }

    if (dto.actualRpe !== undefined) {
      data.actualRpe = dto.actualRpe;
    }

    if (dto.trainerNotes !== undefined) {
      data.trainerNotes = this.normalizeOptionalText(dto.trainerNotes);
    }

    return data;
  }

  private buildDaysFromSnapshot(snapshot: Prisma.JsonValue) {
    const data = this.asRecord(snapshot);
    const days = Array.isArray(data.days) ? data.days : [];

    return days.map((rawDay) => {
      const day = this.asRecord(rawDay);
      const exercises = Array.isArray(day.exercises) ? day.exercises : [];

      return {
        name: typeof day.name === 'string' ? day.name : 'Día',
        order: typeof day.order === 'number' ? day.order : 1,
        exercises: {
          create: exercises.map((rawItem) =>
            this.buildExerciseCreateFromSnapshot(rawItem),
          ),
        },
      };
    });
  }

  private buildExerciseCreateFromSnapshot(rawItem: unknown) {
    const item = this.asRecord(rawItem);
    const exercise = this.asRecord(item.exercise);

    return {
      order: typeof item.order === 'number' ? item.order : 1,
      exerciseName:
        typeof exercise.name === 'string' ? exercise.name : 'Ejercicio',
      exerciseVideoUrl:
        typeof exercise.videoUrl === 'string' ? exercise.videoUrl : null,
      exerciseImageUrl:
        typeof exercise.imageUrl === 'string' ? exercise.imageUrl : null,
      routineExerciseSnapshot: rawItem as Prisma.InputJsonValue,
      plannedSets: typeof item.sets === 'number' ? item.sets : null,
      plannedRepetitions:
        typeof item.repetitions === 'string' ? item.repetitions : null,
      plannedRestSeconds:
        typeof item.restSeconds === 'number' ? item.restSeconds : null,
      plannedIntensity:
        typeof item.intensity === 'string' ? item.intensity : null,
      plannedTempo: typeof item.tempo === 'string' ? item.tempo : null,
      plannedRir: typeof item.rir === 'number' ? item.rir : null,
      plannedRpe: typeof item.rpe === 'number' ? item.rpe : null,
    };
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private writeHistory(
    tx: Prisma.TransactionClient,
    input: {
      createdByUserId: string;
      trainingSessionId: string;
      trainingSessionDayId?: string;
      studentId: string;
      tenantId: string;
      trainerId: string;
      type: StudentHistoryEventType;
      summary: string;
      source?: string;
    },
  ) {
    return tx.studentHistoryEvent.create({
      data: {
        studentId: input.studentId,
        tenantId: input.tenantId,
        trainerId: input.trainerId,
        createdByUserId: input.createdByUserId,
        type: input.type,
        summary: input.summary,
        metadata: {
          source: input.source ?? 'training-sessions',
          trainingSessionId: input.trainingSessionId,
          ...(input.trainingSessionDayId
            ? { trainingSessionDayId: input.trainingSessionDayId }
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

}
