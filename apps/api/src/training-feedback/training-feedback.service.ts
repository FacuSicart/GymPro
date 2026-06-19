import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  PublicRoutineLinkStatus,
  StudentHistoryEventType,
  User,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateTrainingFeedbackDto } from './dto/create-training-feedback.dto';
import { ListTrainingFeedbackQueryDto } from './dto/list-training-feedback-query.dto';
import {
  toPublicFeedbackConfirmation,
  toPublicTrainingFeedback,
  toPublicTrainingFeedbacks,
} from './training-feedback-presenter';

const trainingFeedbackInclude = {
  student: true,
  routine: true,
  trainingSessionDay: true,
} satisfies Prisma.TrainingFeedbackInclude;

const recurrentDiscomfortThreshold = 3;
const recurrentDiscomfortLookbackDays = 30;
const recurrentDiscomfortEventWindowDays = 30;

type DiscomfortFeedbackInput = {
  id: string;
  discomfortArea: string | null;
  discomfortIntensity: number | null;
  discomfortDescription: string | null;
  submittedAt: Date;
};

type RecurrentDiscomfortSummary = {
  area: string;
  areaKey: string;
  reportCount: number;
  averageIntensity: number | null;
  maxIntensity: number | null;
  lastReportedAt: Date;
  recentComments: string[];
  feedbackIds: string[];
};

@Injectable()
export class TrainingFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async listFeedback(user: User, query: ListTrainingFeedbackQueryDto) {
    const feedbacks = await this.prisma.trainingFeedback.findMany({
      where: this.buildListWhere(user, query),
      include: trainingFeedbackInclude,
      orderBy: { submittedAt: 'desc' },
    });

    return toPublicTrainingFeedbacks(feedbacks);
  }

  async getFeedback(user: User, id: string) {
    const feedback = await this.findAccessibleFeedback(user, id);

    return toPublicTrainingFeedback(feedback);
  }

  async listByStudent(user: User, studentId: string) {
    const student = await this.findAccessibleStudent(user, studentId);

    const feedbacks = await this.prisma.trainingFeedback.findMany({
      where: {
        studentId: student.id,
        ...(user.role === UserRole.TRAINER ? { trainerId: user.id } : {}),
      },
      include: trainingFeedbackInclude,
      orderBy: { submittedAt: 'desc' },
    });

    return toPublicTrainingFeedbacks(feedbacks);
  }

  async listBySession(user: User, sessionId: string) {
    const session = await this.findAccessibleSession(user, sessionId);

    const feedbacks = await this.prisma.trainingFeedback.findMany({
      where: { trainingSessionId: session.id },
      include: trainingFeedbackInclude,
      orderBy: { submittedAt: 'desc' },
    });

    return toPublicTrainingFeedbacks(feedbacks);
  }

  async listRecurrentDiscomforts(user: User, studentId: string) {
    const student = await this.findAccessibleStudent(user, studentId);
    const since = this.daysAgo(recurrentDiscomfortLookbackDays);
    const feedbacks = await this.prisma.trainingFeedback.findMany({
      where: {
        studentId: student.id,
        hadDiscomfort: true,
        discomfortArea: { not: null },
        submittedAt: { gte: since },
        ...(user.role === UserRole.TRAINER ? { trainerId: user.id } : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });

    return this.summarizeRecurrentDiscomforts(feedbacks);
  }

  async getPublicFeedbackStatus(token: string) {
    const { routine } = await this.findActivePublicLink(token);
    const day = await this.findLatestCompletedDayWithoutFeedback(
      routine.id,
      routine.versions?.[0]?.id,
    );

    return day ? { pending: true, dayName: day.name } : null;
  }

  async createPublicFeedback(token: string, dto: CreateTrainingFeedbackDto) {
    const { link, routine } = await this.findActivePublicLink(token);
    const day = await this.findLatestCompletedDayWithoutFeedback(
      routine.id,
      routine.versions?.[0]?.id,
    );

    if (!day) {
      throw new BadRequestException(
        'No completed training day pending feedback.',
      );
    }

    const session = day.trainingSession;

    try {
      const feedback = await this.prisma.$transaction(async (tx) => {
        const created = await tx.trainingFeedback.create({
          data: {
            tenantId: routine.tenantId,
            studentId: routine.studentId,
            trainerId: routine.trainerId,
            routineId: routine.id,
            routineVersionId: session.routineVersionId,
            trainingSessionId: session.id,
            trainingSessionDayId: day.id,
            publicRoutineLinkId: link.id,
            difficultyScore: dto.difficultyScore,
            energyScore: dto.energyScore,
            completedWorkout: dto.completedWorkout,
            incompleteReason: dto.completedWorkout
              ? null
              : this.normalizeOptionalText(dto.incompleteReason),
            hadDiscomfort: dto.hadDiscomfort,
            discomfortArea: dto.hadDiscomfort
              ? this.normalizeOptionalText(dto.discomfortArea)
              : null,
            discomfortIntensity: dto.hadDiscomfort
              ? dto.discomfortIntensity ?? null
              : null,
            discomfortDescription: dto.hadDiscomfort
              ? this.normalizeOptionalText(dto.discomfortDescription)
              : null,
            generalComment: this.normalizeOptionalText(dto.generalComment),
          },
        });

        await tx.studentHistoryEvent.create({
          data: {
            studentId: routine.studentId,
            tenantId: routine.tenantId,
            trainerId: routine.trainerId,
            createdByUserId: routine.trainerId,
            type: StudentHistoryEventType.TRAINING_FEEDBACK_SUBMITTED,
            summary: `Feedback enviado por el alumno (${day.name}): dificultad ${created.difficultyScore}/10, energía ${created.energyScore}/10.`,
            metadata: {
              source: 'public-link',
              trainingFeedbackId: created.id,
              trainingSessionId: session.id,
              trainingSessionDayId: day.id,
            },
          },
        });

        if (created.hadDiscomfort) {
          await tx.studentHistoryEvent.create({
            data: {
              studentId: routine.studentId,
              tenantId: routine.tenantId,
              trainerId: routine.trainerId,
              createdByUserId: routine.trainerId,
              type: StudentHistoryEventType.TRAINING_FEEDBACK_DISCOMFORT_REPORTED,
              summary: created.discomfortArea
                ? `Molestia reportada por el alumno (${day.name}): ${created.discomfortArea}.`
                : `Molestia reportada por el alumno (${day.name}).`,
              metadata: {
                source: 'public-link',
                trainingFeedbackId: created.id,
                trainingSessionId: session.id,
                trainingSessionDayId: day.id,
              },
            },
          });

          await this.createRecurrentDiscomfortEventIfNeeded(tx, {
            studentId: routine.studentId,
            tenantId: routine.tenantId,
            trainerId: routine.trainerId,
            trainingFeedbackId: created.id,
            trainingSessionId: session.id,
            trainingSessionDayId: day.id,
            dayName: day.name,
            discomfortArea: created.discomfortArea,
          });
        }

        return created;
      });

      return toPublicFeedbackConfirmation({ ...feedback, dayName: day.name });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Feedback already submitted for this training session.',
        );
      }

      throw error;
    }
  }

  private buildListWhere(
    user: User,
    query: ListTrainingFeedbackQueryDto,
  ): Prisma.TrainingFeedbackWhereInput {
    const where: Prisma.TrainingFeedbackWhereInput = {};

    if (query.studentId) {
      where.studentId = query.studentId;
    }

    if (query.trainingSessionId) {
      where.trainingSessionId = query.trainingSessionId;
    }

    if (query.routineId) {
      where.routineId = query.routineId;
    }

    if (user.role === UserRole.TRAINER) {
      where.trainerId = user.id;
    }

    return where;
  }

  private async findAccessibleFeedback(user: User, id: string) {
    const feedback = await this.prisma.trainingFeedback.findFirst({
      where: {
        id,
        ...(user.role === UserRole.TRAINER ? { trainerId: user.id } : {}),
      },
      include: trainingFeedbackInclude,
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found.');
    }

    return feedback;
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

  private async findAccessibleSession(user: User, sessionId: string) {
    const session = await this.prisma.trainingSession.findFirst({
      where: {
        id: sessionId,
        ...(user.role === UserRole.TRAINER ? { trainerId: user.id } : {}),
      },
    });

    if (!session) {
      throw new NotFoundException('Training session not found.');
    }

    return session;
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

  private async findLatestCompletedDayWithoutFeedback(
    routineId: string,
    routineVersionId?: string,
  ) {
    return this.prisma.trainingSessionDay.findFirst({
      where: {
        trainingSession: {
          routineId,
          ...(routineVersionId ? { routineVersionId } : {}),
        },
        completedAt: { not: null },
        feedback: null,
      },
      orderBy: { completedAt: 'desc' },
      include: { trainingSession: true },
    });
  }

  private normalizeOptionalText(value?: string | null) {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
  }

  private async createRecurrentDiscomfortEventIfNeeded(
    tx: Prisma.TransactionClient,
    input: {
      studentId: string;
      tenantId: string;
      trainerId: string;
      trainingFeedbackId: string;
      trainingSessionId: string;
      trainingSessionDayId: string;
      dayName: string;
      discomfortArea: string | null;
    },
  ) {
    const areaKey = this.normalizeDiscomfortAreaKey(input.discomfortArea);

    if (!areaKey) {
      return;
    }

    const since = this.daysAgo(recurrentDiscomfortLookbackDays);
    const feedbacks = await tx.trainingFeedback.findMany({
      where: {
        studentId: input.studentId,
        hadDiscomfort: true,
        discomfortArea: { not: null },
        submittedAt: { gte: since },
      },
      orderBy: { submittedAt: 'desc' },
    });
    const summary = this.summarizeRecurrentDiscomforts(feedbacks).find(
      (item) => item.areaKey === areaKey,
    );

    if (!summary || summary.reportCount < recurrentDiscomfortThreshold) {
      return;
    }

    const recentEvents = await tx.studentHistoryEvent.findMany({
      where: {
        studentId: input.studentId,
        type: StudentHistoryEventType.TRAINING_FEEDBACK_RECURRENT_DISCOMFORT_DETECTED,
        createdAt: { gte: this.daysAgo(recurrentDiscomfortEventWindowDays) },
      },
    });
    const alreadyReported = recentEvents.some((event) => {
      const metadata = event.metadata;

      return (
        metadata !== null &&
        typeof metadata === 'object' &&
        !Array.isArray(metadata) &&
        (metadata as Record<string, unknown>).discomfortAreaKey === areaKey
      );
    });

    if (alreadyReported) {
      return;
    }

    await tx.studentHistoryEvent.create({
      data: {
        studentId: input.studentId,
        tenantId: input.tenantId,
        trainerId: input.trainerId,
        createdByUserId: input.trainerId,
        type: StudentHistoryEventType.TRAINING_FEEDBACK_RECURRENT_DISCOMFORT_DETECTED,
        summary: `Molestia recurrente detectada (${summary.area}): ${summary.reportCount} reportes en los ultimos ${recurrentDiscomfortLookbackDays} dias.`,
        metadata: {
          source: 'training-feedback',
          discomfortArea: summary.area,
          discomfortAreaKey: summary.areaKey,
          reportCount: summary.reportCount,
          averageIntensity: summary.averageIntensity,
          maxIntensity: summary.maxIntensity,
          lastReportedAt: summary.lastReportedAt,
          feedbackIds: summary.feedbackIds,
          trainingFeedbackId: input.trainingFeedbackId,
          trainingSessionId: input.trainingSessionId,
          trainingSessionDayId: input.trainingSessionDayId,
          dayName: input.dayName,
        },
      },
    });
  }

  private summarizeRecurrentDiscomforts(
    feedbacks: DiscomfortFeedbackInput[],
  ): RecurrentDiscomfortSummary[] {
    const groups = new Map<
      string,
      {
        area: string;
        items: DiscomfortFeedbackInput[];
      }
    >();

    for (const feedback of feedbacks) {
      const areaKey = this.normalizeDiscomfortAreaKey(feedback.discomfortArea);

      if (!areaKey) {
        continue;
      }

      const existing = groups.get(areaKey);
      if (existing) {
        existing.items.push(feedback);
      } else {
        groups.set(areaKey, {
          area: feedback.discomfortArea?.trim() ?? areaKey,
          items: [feedback],
        });
      }
    }

    return Array.from(groups.entries())
      .map(([areaKey, group]) => {
        const sortedItems = [...group.items].sort(
          (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
        );
        const intensities = sortedItems
          .map((item) => item.discomfortIntensity)
          .filter((value): value is number => typeof value === 'number');
        const averageIntensity = intensities.length
          ? Math.round(
              (intensities.reduce((sum, value) => sum + value, 0) /
                intensities.length) *
                10,
            ) / 10
          : null;

        return {
          area: group.area,
          areaKey,
          reportCount: sortedItems.length,
          averageIntensity,
          maxIntensity: intensities.length ? Math.max(...intensities) : null,
          lastReportedAt: sortedItems[0].submittedAt,
          recentComments: sortedItems
            .map((item) => this.normalizeOptionalText(item.discomfortDescription))
            .filter((value): value is string => Boolean(value))
            .slice(0, 3),
          feedbackIds: sortedItems.map((item) => item.id),
        };
      })
      .filter((item) => item.reportCount >= recurrentDiscomfortThreshold)
      .sort((a, b) => b.lastReportedAt.getTime() - a.lastReportedAt.getTime());
  }

  private normalizeDiscomfortAreaKey(value?: string | null) {
    const normalized = this.normalizeOptionalText(value)
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();

    return normalized ?? null;
  }

  private daysAgo(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return date;
  }
}
