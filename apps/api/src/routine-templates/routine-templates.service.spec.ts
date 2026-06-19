import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ExerciseGoal,
  RoutineStatus,
  RoutineTemplateStatus,
  StudentHistoryEventType,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { RoutineTemplatesService } from './routine-templates.service';

describe('RoutineTemplatesService', () => {
  const trainer = {
    id: 'trainer-1',
    tenantId: 'tenant-1',
    role: UserRole.TRAINER,
    status: UserStatus.ACTIVE,
  };
  const admin = {
    id: 'admin-1',
    tenantId: 'tenant-1',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  };
  const student = {
    id: 'student-1',
    tenantId: trainer.tenantId,
    trainerId: trainer.id,
    status: 'ACTIVE',
  };
  const exercise = {
    id: 'exercise-1',
    name: 'Press banca',
    description: 'desc',
    primaryMuscleGroup: 'Pecho',
    secondaryMuscleGroups: [],
    movementPattern: 'Empuje',
    equipmentNeeded: 'Barra',
    equipmentType: 'libre',
    levels: ['BEGINNER'],
    goals: [ExerciseGoal.HYPERTROPHY],
    technicalInstructions: 'tecnica',
    commonMistakes: null,
    contraindications: null,
    videoUrl: null,
    imageUrl: null,
  };
  const template = {
    id: 'template-1',
    trainerId: trainer.id,
    tenantId: trainer.tenantId,
    name: 'Fuerza 3 dias',
    description: null,
    goal: ExerciseGoal.HYPERTROPHY,
    status: RoutineTemplateStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    trainer: {
      firstName: 'Trainer',
      lastName: 'Uno',
    },
    days: [
      {
        id: 'template-day-1',
        templateId: 'template-1',
        name: 'Dia 1',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [
          {
            id: 'template-exercise-1',
            templateDayId: 'template-day-1',
            exerciseId: exercise.id,
            order: 1,
            sets: 4,
            repetitions: '8-12',
            restSeconds: 90,
            intensity: null,
            tempo: null,
            rir: 2,
            rpe: null,
            observations: null,
            exerciseSnapshot: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            exercise,
          },
        ],
      },
    ],
  };
  const routine = {
    id: 'routine-1',
    studentId: student.id,
    trainerId: trainer.id,
    tenantId: trainer.tenantId,
    name: template.name,
    description: null,
    goal: template.goal,
    status: RoutineStatus.DRAFT,
    startDate: null,
    endDate: null,
    version: 0,
    publishedAt: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    student: {
      id: student.id,
      firstName: 'Martina',
      lastName: 'Lopez',
      email: null,
      phone: null,
    },
    trainer: {
      firstName: 'Trainer',
      lastName: 'Uno',
    },
    days: [],
    versions: [],
  };

  const tx = {
    routineTemplate: {
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    routineTemplateDay: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    routine: {
      create: jest.fn(),
    },
    studentHistoryEvent: {
      create: jest.fn(),
    },
  };

  const prisma = {
    routineTemplate: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    student: {
      findMany: jest.fn(),
    },
    exercise: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    );
    prisma.exercise.findMany.mockResolvedValue([{ id: exercise.id }]);
    prisma.routineTemplate.findFirst.mockResolvedValue(template);
    prisma.student.findMany.mockResolvedValue([student]);
    tx.routine.create.mockResolvedValue(routine);
  });

  it('creates trainer-owned routine templates', async () => {
    prisma.routineTemplate.create.mockResolvedValue(template);
    const service = new RoutineTemplatesService(prisma as never);

    await service.createTemplate(trainer as never, {
      name: ' Fuerza 3 dias ',
      goal: ExerciseGoal.HYPERTROPHY,
      days: [
        {
          name: 'Dia 1',
          order: 1,
          exercises: [{ exerciseId: exercise.id, order: 1, sets: 4 }],
        },
      ],
    });

    expect(prisma.routineTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: trainer.tenantId,
          trainerId: trainer.id,
          name: 'Fuerza 3 dias',
        }),
      }),
    );
  });

  it('rejects admin mutations for routine templates', async () => {
    const service = new RoutineTemplatesService(prisma as never);

    await expect(
      service.createTemplate(admin as never, { name: 'Base' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects templates with unavailable catalog exercises', async () => {
    prisma.exercise.findMany.mockResolvedValue([]);
    const service = new RoutineTemplatesService(prisma as never);

    await expect(
      service.createTemplate(trainer as never, {
        name: 'Base',
        days: [
          {
            name: 'Dia 1',
            order: 1,
            exercises: [{ exerciseId: exercise.id, order: 1 }],
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('assigns templates by creating draft routines and history events', async () => {
    const service = new RoutineTemplatesService(prisma as never);

    await service.assignTemplate(trainer as never, template.id, {
      studentIds: [student.id],
    });

    expect(tx.routine.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          studentId: student.id,
          trainerId: trainer.id,
          tenantId: student.tenantId,
          name: template.name,
          days: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                name: 'Dia 1',
                exercises: expect.objectContaining({
                  create: expect.arrayContaining([
                    expect.objectContaining({ exerciseId: exercise.id }),
                  ]),
                }),
              }),
            ]),
          }),
        }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: student.id,
        type: StudentHistoryEventType.ROUTINE_CREATED,
        metadata: expect.objectContaining({
          source: 'routine-templates',
          routineTemplateId: template.id,
          routineId: routine.id,
        }),
      }),
    });
  });

  it('rejects assignments when any selected student is not owned by the trainer', async () => {
    prisma.student.findMany.mockResolvedValue([]);
    const service = new RoutineTemplatesService(prisma as never);

    await expect(
      service.assignTemplate(trainer as never, template.id, {
        studentIds: [student.id],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not assign archived templates', async () => {
    prisma.routineTemplate.findFirst.mockResolvedValue({
      ...template,
      status: RoutineTemplateStatus.ARCHIVED,
    });
    const service = new RoutineTemplatesService(prisma as never);

    await expect(
      service.assignTemplate(trainer as never, template.id, {
        studentIds: [student.id],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
