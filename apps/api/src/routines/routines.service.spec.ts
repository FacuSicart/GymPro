import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ExerciseGoal,
  RoutineStatus,
  StudentHistoryEventType,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { RoutinesService } from './routines.service';

describe('RoutinesService', () => {
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
    tenantId: 'tenant-1',
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
    technicalInstructions: 'tecnica',
    commonMistakes: null,
    contraindications: null,
    videoUrl: null,
    imageUrl: null,
  };
  const routine = {
    id: 'routine-1',
    studentId: student.id,
    trainerId: trainer.id,
    tenantId: trainer.tenantId,
    name: 'Rutina 1',
    description: null,
    goal: ExerciseGoal.HYPERTROPHY,
    status: RoutineStatus.DRAFT,
    startDate: null,
    endDate: null,
    version: 0,
    publishedAt: null,
    archivedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
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
    days: [
      {
        id: 'day-1',
        routineId: 'routine-1',
        name: 'Dia 1',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [
          {
            id: 'routine-exercise-1',
            trainingDayId: 'day-1',
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
    versions: [],
  };

  const tx = {
    routine: {
      create: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    trainingDay: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    routineVersion: {
      create: jest.fn(),
    },
    publicRoutineLink: {
      create: jest.fn(),
      update: jest.fn(),
    },
    studentHistoryEvent: {
      create: jest.fn(),
    },
  };

  const prisma = {
    routine: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
    },
    exercise: {
      findMany: jest.fn(),
    },
    routineVersion: {
      findMany: jest.fn(),
    },
    publicRoutineLink: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    );
    prisma.student.findFirst.mockResolvedValue(student);
    prisma.exercise.findMany.mockResolvedValue([{ id: exercise.id }]);
    prisma.publicRoutineLink.findFirst.mockResolvedValue(null);
  });

  it('creates trainer-owned draft routines and writes student history', async () => {
    tx.routine.create.mockResolvedValue(routine);
    const service = new RoutinesService(prisma as never);

    await service.createRoutine(trainer as never, {
      studentId: student.id,
      name: 'Rutina 1',
      goal: ExerciseGoal.HYPERTROPHY,
      days: [
        {
          name: 'Dia 1',
          order: 1,
          exercises: [{ exerciseId: exercise.id, order: 1, sets: 4 }],
        },
      ],
    });

    expect(tx.routine.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          studentId: student.id,
          trainerId: trainer.id,
          tenantId: trainer.tenantId,
        }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.ROUTINE_CREATED,
        studentId: student.id,
      }),
    });
  });

  it('rejects admin mutations for routines', async () => {
    const service = new RoutinesService(prisma as never);

    await expect(
      service.createRoutine(admin as never, {
        studentId: student.id,
        name: 'Rutina admin',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admins to list routines across trainer tenants', async () => {
    prisma.routine.findMany.mockResolvedValue([]);
    const service = new RoutinesService(prisma as never);

    await service.listRoutines(admin as never, { studentId: student.id });

    expect(prisma.routine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { studentId: student.id },
      }),
    );
  });

  it('rejects routines for students not owned by the trainer', async () => {
    prisma.student.findFirst.mockResolvedValue(null);
    const service = new RoutinesService(prisma as never);

    await expect(
      service.createRoutine(trainer as never, {
        studentId: 'other-student',
        name: 'Rutina',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects exercises outside approved active catalog', async () => {
    prisma.exercise.findMany.mockResolvedValue([]);
    const service = new RoutinesService(prisma as never);

    await expect(
      service.createRoutine(trainer as never, {
        studentId: student.id,
        name: 'Rutina',
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

  it('publishes routines by creating a version snapshot', async () => {
    prisma.routine.findFirst.mockResolvedValue(routine);
    tx.routine.update.mockResolvedValue({
      ...routine,
      status: RoutineStatus.ACTIVE,
      version: 1,
      versions: [{ id: 'version-1', routineId: routine.id, version: 1 }],
    });
    const service = new RoutinesService(prisma as never);

    await service.publishRoutine(trainer as never, routine.id);

    expect(tx.routineVersion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        routineId: routine.id,
        version: 1,
        createdByUserId: trainer.id,
      }),
    });
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.ROUTINE_PUBLISHED,
      }),
    });
  });

  it('does not publish empty routines', async () => {
    prisma.routine.findFirst.mockResolvedValue({ ...routine, days: [] });
    const service = new RoutinesService(prisma as never);

    await expect(
      service.publishRoutine(trainer as never, routine.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('generates public links only for active routines', async () => {
    prisma.routine.findFirst.mockResolvedValue(routine);
    const service = new RoutinesService(prisma as never);

    await expect(
      service.generatePublicLink(trainer as never, routine.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reuses an existing active public link', async () => {
    const activeRoutine = {
      ...routine,
      status: RoutineStatus.ACTIVE,
      versions: [{ id: 'version-1', routineId: routine.id, version: 1, snapshot: {} }],
    };
    const link = {
      id: 'link-1',
      routineId: routine.id,
      token: 'public-token',
      status: 'ACTIVE',
      createdByUserId: trainer.id,
      revokedByUserId: null,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.routine.findFirst.mockResolvedValue(activeRoutine);
    prisma.publicRoutineLink.findFirst.mockResolvedValue(link);
    const service = new RoutinesService(prisma as never);

    const result = await service.generatePublicLink(trainer as never, routine.id);

    expect(result).toEqual(expect.objectContaining({ token: 'public-token' }));
    expect(prisma.publicRoutineLink.create).not.toHaveBeenCalled();
  });

  it('revokes active public links', async () => {
    const link = {
      id: 'link-1',
      routineId: routine.id,
      token: 'public-token',
      status: 'ACTIVE',
      createdByUserId: trainer.id,
      revokedByUserId: null,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.routine.findFirst.mockResolvedValue({ ...routine, status: RoutineStatus.ACTIVE });
    prisma.publicRoutineLink.findFirst.mockResolvedValue(link);
    prisma.publicRoutineLink.update.mockResolvedValue({
      ...link,
      status: 'REVOKED',
      revokedByUserId: trainer.id,
      revokedAt: new Date(),
    });
    const service = new RoutinesService(prisma as never);

    await service.revokePublicLink(trainer as never, routine.id);

    expect(prisma.publicRoutineLink.update).toHaveBeenCalledWith({
      where: { id: link.id },
      data: expect.objectContaining({
        status: 'REVOKED',
        revokedByUserId: trainer.id,
      }),
      select: expect.any(Object),
    });
  });

  it('blocks revoked public routine links', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue({
      id: 'link-1',
      token: 'public-token',
      status: 'REVOKED',
      routine: {
        versions: [{ snapshot: {} }],
      },
    });
    const service = new RoutinesService(prisma as never);

    await expect(service.getPublicRoutineByToken('public-token')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
