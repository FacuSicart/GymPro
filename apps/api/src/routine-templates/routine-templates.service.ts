import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ExerciseApprovalStatus,
  ExerciseOperationalStatus,
  Prisma,
  RoutineTemplateStatus,
  StudentHistoryEventType,
  User,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { TrainingDayDto } from '../routines/dto/training-day.dto';
import { toPublicRoutines } from '../routines/routine-presenter';
import { AssignRoutineTemplateDto } from './dto/assign-routine-template.dto';
import { CreateRoutineTemplateDto } from './dto/create-routine-template.dto';
import { ListRoutineTemplatesQueryDto } from './dto/list-routine-templates-query.dto';
import { UpdateRoutineTemplateDto } from './dto/update-routine-template.dto';
import {
  toPublicRoutineTemplate,
  toPublicRoutineTemplates,
} from './routine-template-presenter';

const routineTemplateInclude = {
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
} satisfies Prisma.RoutineTemplateInclude;

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

@Injectable()
export class RoutineTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async listTemplates(user: User, query: ListRoutineTemplatesQueryDto) {
    const templates = await this.prisma.routineTemplate.findMany({
      where: {
        ...this.buildListWhere(user),
        ...(query.status ? { status: query.status } : {}),
      },
      include: routineTemplateInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return toPublicRoutineTemplates(templates);
  }

  async getTemplate(user: User, templateId: string) {
    const template = await this.findAccessibleTemplate(user, templateId);

    return toPublicRoutineTemplate(template);
  }

  async createTemplate(user: User, dto: CreateRoutineTemplateDto) {
    this.assertTrainer(user);
    this.validateStructure(dto.days ?? []);
    await this.assertOfficialExercises(dto.days ?? []);

    const template = await this.prisma.routineTemplate.create({
      data: {
        tenantId: user.tenantId,
        trainerId: user.id,
        name: dto.name.trim(),
        description: this.normalizeOptionalText(dto.description),
        goal: dto.goal ?? null,
        daysPerWeek: dto.daysPerWeek ?? null,
        days: {
          create: this.buildDaysCreate(dto.days ?? []),
        },
      },
      include: routineTemplateInclude,
    });

    return toPublicRoutineTemplate(template);
  }

  async updateTemplate(
    user: User,
    templateId: string,
    dto: UpdateRoutineTemplateDto,
  ) {
    const current = await this.findTrainerOwnedTemplate(user, templateId);

    if (current.status === RoutineTemplateStatus.ARCHIVED) {
      throw new BadRequestException('Archived templates cannot be edited.');
    }

    if (dto.days !== undefined) {
      this.validateStructure(dto.days);
      await this.assertOfficialExercises(dto.days);
    }

    const template = await this.prisma.$transaction(async (tx) => {
      await tx.routineTemplate.update({
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
        },
      });

      if (dto.days !== undefined) {
        await tx.routineTemplateDay.deleteMany({
          where: { templateId: current.id },
        });
        for (const day of dto.days) {
          await tx.routineTemplateDay.create({
            data: {
              templateId: current.id,
              name: day.name.trim(),
              order: day.order,
              exercises: {
                create: day.exercises.map((item) =>
                  this.buildTemplateExerciseCreate(item),
                ),
              },
            },
          });
        }
      }

      return tx.routineTemplate.findUniqueOrThrow({
        where: { id: current.id },
        include: routineTemplateInclude,
      });
    });

    return toPublicRoutineTemplate(template);
  }

  async archiveTemplate(user: User, templateId: string) {
    const current = await this.findTrainerOwnedTemplate(user, templateId);

    if (current.status === RoutineTemplateStatus.ARCHIVED) {
      return toPublicRoutineTemplate(current);
    }

    const template = await this.prisma.routineTemplate.update({
      where: { id: current.id },
      data: { status: RoutineTemplateStatus.ARCHIVED },
      include: routineTemplateInclude,
    });

    return toPublicRoutineTemplate(template);
  }

  async deleteTemplate(user: User, templateId: string) {
    const current = await this.findTrainerOwnedTemplate(user, templateId);

    await this.prisma.routineTemplate.delete({
      where: { id: current.id },
    });

    return { deleted: true };
  }

  async assignTemplate(
    user: User,
    templateId: string,
    dto: AssignRoutineTemplateDto,
  ) {
    const template = await this.findTrainerOwnedTemplate(user, templateId);

    if (template.status === RoutineTemplateStatus.ARCHIVED) {
      throw new BadRequestException('Archived templates cannot be assigned.');
    }

    if (!template.days.length) {
      throw new BadRequestException('Template must have at least one day.');
    }

    const students = await this.prisma.student.findMany({
      where: {
        id: { in: [...new Set(dto.studentIds)] },
        trainerId: user.id,
        tenantId: user.tenantId,
        status: 'ACTIVE',
      },
    });

    if (students.length !== new Set(dto.studentIds).size) {
      throw new NotFoundException('One or more students were not found.');
    }

    const routines = await this.prisma.$transaction(async (tx) => {
      const created = [];

      for (const student of students) {
        const routine = await tx.routine.create({
          data: {
            studentId: student.id,
            trainerId: user.id,
            tenantId: student.tenantId,
            name: template.name,
            description: template.description,
            goal: template.goal,
            daysPerWeek: template.daysPerWeek,
            days: {
              create: template.days.map((day) => ({
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

        await tx.studentHistoryEvent.create({
          data: {
            studentId: student.id,
            tenantId: student.tenantId,
            trainerId: user.id,
            createdByUserId: user.id,
            type: StudentHistoryEventType.ROUTINE_CREATED,
            summary: `Rutina creada desde plantilla: ${template.name}.`,
            metadata: {
              source: 'routine-templates',
              routineTemplateId: template.id,
              routineId: routine.id,
            },
          },
        });

        created.push(routine);
      }

      return created;
    });

    return toPublicRoutines(routines);
  }

  private buildListWhere(user: User): Prisma.RoutineTemplateWhereInput {
    if (user.role === UserRole.TRAINER) {
      return { trainerId: user.id };
    }

    return { tenantId: user.tenantId };
  }

  private async findAccessibleTemplate(user: User, templateId: string) {
    const template = await this.prisma.routineTemplate.findFirst({
      where: {
        id: templateId,
        ...this.buildListWhere(user),
      },
      include: routineTemplateInclude,
    });

    if (!template) {
      throw new NotFoundException('Routine template not found.');
    }

    return template;
  }

  private async findTrainerOwnedTemplate(user: User, templateId: string) {
    this.assertTrainer(user);

    const template = await this.prisma.routineTemplate.findFirst({
      where: { id: templateId, trainerId: user.id, tenantId: user.tenantId },
      include: routineTemplateInclude,
    });

    if (!template) {
      throw new NotFoundException('Routine template not found.');
    }

    return template;
  }

  private assertTrainer(user: User) {
    if (user.role !== UserRole.TRAINER) {
      throw new ForbiddenException('Trainer role is required.');
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
        'Templates can only use approved and active catalog exercises.',
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

  private buildDaysCreate(days: TrainingDayDto[]) {
    return days.map((day) => ({
      name: day.name.trim(),
      order: day.order,
      exercises: {
        create: day.exercises.map((item) =>
          this.buildTemplateExerciseCreate(item),
        ),
      },
    }));
  }

  private buildTemplateExerciseCreate(item: {
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

  private normalizeOptionalText(value?: string | null) {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
  }
}
