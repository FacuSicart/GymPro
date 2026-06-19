import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  RoutineStatus,
  StudentHistoryEventType,
  TrainingSessionStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { TrainingSessionsService } from './training-sessions.service';

describe('TrainingSessionsService', () => {
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

  const routineSnapshot = {
    routine: { id: 'routine-1', name: 'Rutina Fuerza' },
    student: { id: 'student-1', firstName: 'Martina', lastName: 'Lopez' },
    trainer: { firstName: 'Trainer', lastName: 'Uno' },
    days: [
      {
        id: 'day-1',
        name: 'Dia 1',
        order: 1,
        exercises: [
          {
            id: 'routine-exercise-1',
            exerciseId: 'exercise-1',
            order: 1,
            sets: 4,
            repetitions: '8-12',
            restSeconds: 90,
            intensity: null,
            tempo: null,
            rir: 2,
            rpe: null,
            observations: null,
            exercise: {
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
              videoUrl: 'https://video',
              imageUrl: null,
            },
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const routineActive = {
    id: 'routine-1',
    tenantId: 'tenant-1',
    studentId: 'student-1',
    trainerId: trainer.id,
    name: 'Rutina Fuerza',
    status: RoutineStatus.ACTIVE,
    versions: [
      { id: 'version-1', routineId: 'routine-1', version: 1, snapshot: routineSnapshot },
    ],
  };

  const sessionRecord = {
    id: 'session-1',
    tenantId: 'tenant-1',
    studentId: 'student-1',
    trainerId: trainer.id,
    routineId: 'routine-1',
    routineVersionId: 'version-1',
    status: TrainingSessionStatus.PLANNED,
    scheduledDate: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    student: { id: 'student-1', firstName: 'Martina', lastName: 'Lopez' },
    trainer: { firstName: 'Trainer', lastName: 'Uno' },
    routine: { id: 'routine-1', name: 'Rutina Fuerza' },
    routineVersion: { version: 1 },
    days: [
      {
        id: 'session-day-1',
        name: 'Dia 1',
        order: 1,
        exercises: [
          {
            id: 'session-exercise-1',
            trainingSessionDayId: 'session-day-1',
            order: 1,
            exerciseName: 'Press banca',
            exerciseVideoUrl: 'https://video',
            exerciseImageUrl: null,
            routineExerciseSnapshot: {},
            plannedSets: 4,
            plannedRepetitions: '8-12',
            plannedRestSeconds: 90,
            plannedIntensity: null,
            plannedTempo: null,
            plannedRir: 2,
            plannedRpe: null,
            completed: false,
            actualSets: null,
            actualRepetitions: null,
            actualLoad: null,
            actualRestSeconds: null,
            actualRir: null,
            actualRpe: null,
            trainerNotes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ],
  };

  const sessionExerciseRecord = sessionRecord.days[0].exercises[0];

  const publicLinkActive = {
    id: 'link-1',
    routineId: routineActive.id,
    token: 'public-token',
    status: 'ACTIVE',
    routine: routineActive,
  };

  const tx = {
    trainingSession: {
      create: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    trainingSessionDay: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
    trainingSessionExercise: {
      update: jest.fn(),
    },
    studentHistoryEvent: {
      create: jest.fn(),
    },
  };

  const prisma = {
    routine: {
      findFirst: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
    },
    trainingSession: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    trainingSessionDay: {
      findFirst: jest.fn(),
    },
    trainingSessionExercise: {
      findFirst: jest.fn(),
    },
    publicRoutineLink: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    );
  });

  it('creates a training session from an active routine using the published snapshot', async () => {
    prisma.routine.findFirst.mockResolvedValue(routineActive);
    tx.trainingSession.create.mockResolvedValue(sessionRecord);
    const service = new TrainingSessionsService(prisma as never);

    await service.createSession(trainer as never, { routineId: routineActive.id });

    expect(tx.trainingSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: routineActive.tenantId,
          studentId: routineActive.studentId,
          trainerId: routineActive.trainerId,
          routineId: routineActive.id,
          routineVersionId: 'version-1',
          days: {
            create: [
              expect.objectContaining({
                name: 'Dia 1',
                order: 1,
                exercises: {
                  create: [
                    expect.objectContaining({
                      exerciseName: 'Press banca',
                      plannedSets: 4,
                      plannedRepetitions: '8-12',
                      routineExerciseSnapshot: expect.objectContaining({
                        exerciseId: 'exercise-1',
                      }),
                    }),
                  ],
                },
              }),
            ],
          },
        }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_SESSION_CREATED,
        studentId: routineActive.studentId,
      }),
    });
  });

  it('rejects creating a session from a draft routine', async () => {
    prisma.routine.findFirst.mockResolvedValue({
      ...routineActive,
      status: RoutineStatus.DRAFT,
      versions: [],
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.createSession(trainer as never, { routineId: routineActive.id }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects creating a session from an archived routine', async () => {
    prisma.routine.findFirst.mockResolvedValue({
      ...routineActive,
      status: RoutineStatus.ARCHIVED,
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.createSession(trainer as never, { routineId: routineActive.id }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects session creation for routines not owned by the trainer', async () => {
    prisma.routine.findFirst.mockResolvedValue(null);
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.createSession(trainer as never, { routineId: 'other-routine' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects session creation by non-trainer users', async () => {
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.createSession(admin as never, { routineId: routineActive.id }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.routine.findFirst).not.toHaveBeenCalled();
  });

  it('allows admins to list sessions across trainer tenants', async () => {
    prisma.trainingSession.findMany.mockResolvedValue([]);
    const service = new TrainingSessionsService(prisma as never);

    await service.listSessions(admin as never, { studentId: 'student-1' });

    expect(prisma.trainingSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { studentId: 'student-1' },
      }),
    );
  });

  it('allows admins to list sessions by any accessible student', async () => {
    prisma.student.findFirst.mockResolvedValue({ id: 'student-1' });
    prisma.trainingSession.findMany.mockResolvedValue([]);
    const service = new TrainingSessionsService(prisma as never);

    await service.listByStudent(admin as never, 'student-1');

    expect(prisma.student.findFirst).toHaveBeenCalledWith({
      where: { id: 'student-1' },
    });
    expect(prisma.trainingSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { studentId: 'student-1' },
      }),
    );
  });

  it('starts a planned session', async () => {
    prisma.trainingSession.findFirst.mockResolvedValue(sessionRecord);
    tx.trainingSession.update.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    const service = new TrainingSessionsService(prisma as never);

    await service.startSession(trainer as never, sessionRecord.id);

    expect(tx.trainingSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: sessionRecord.id },
        data: expect.objectContaining({ status: TrainingSessionStatus.IN_PROGRESS }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: StudentHistoryEventType.TRAINING_SESSION_STARTED }),
    });
  });

  it('rejects starting a session that is not planned', async () => {
    prisma.trainingSession.findFirst.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.IN_PROGRESS,
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.startSession(trainer as never, sessionRecord.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('completes a planned or in-progress session', async () => {
    prisma.trainingSession.findFirst.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.IN_PROGRESS,
    });
    tx.trainingSession.update.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.COMPLETED,
      completedAt: new Date(),
    });
    const service = new TrainingSessionsService(prisma as never);

    await service.completeSession(trainer as never, sessionRecord.id);

    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: StudentHistoryEventType.TRAINING_SESSION_COMPLETED }),
    });
  });

  it('rejects completing an already completed session', async () => {
    prisma.trainingSession.findFirst.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.COMPLETED,
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.completeSession(trainer as never, sessionRecord.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cancels a planned session', async () => {
    prisma.trainingSession.findFirst.mockResolvedValue(sessionRecord);
    tx.trainingSession.update.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.CANCELLED,
      cancelledAt: new Date(),
    });
    const service = new TrainingSessionsService(prisma as never);

    await service.cancelSession(trainer as never, sessionRecord.id);

    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: StudentHistoryEventType.TRAINING_SESSION_CANCELLED }),
    });
  });

  it('rejects cancelling a completed session', async () => {
    prisma.trainingSession.findFirst.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.COMPLETED,
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.cancelSession(trainer as never, sessionRecord.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates exercise execution data while the session is open', async () => {
    prisma.trainingSessionExercise.findFirst.mockResolvedValue({
      ...sessionExerciseRecord,
      trainingSessionDay: {
        trainingSession: { ...sessionRecord, status: TrainingSessionStatus.PLANNED },
      },
    });
    tx.trainingSessionExercise.update.mockResolvedValue({
      ...sessionExerciseRecord,
      completed: true,
      actualSets: 4,
      actualLoad: '60kg',
    });
    const service = new TrainingSessionsService(prisma as never);

    await service.updateSessionExercise(trainer as never, sessionExerciseRecord.id, {
      completed: true,
      actualSets: 4,
      actualLoad: '60kg',
    });

    expect(tx.trainingSessionExercise.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: sessionExerciseRecord.id },
        data: expect.objectContaining({ completed: true, actualSets: 4, actualLoad: '60kg' }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_SESSION_EXERCISE_UPDATED,
      }),
    });
  });

  it('rejects exercise edits when the session is completed', async () => {
    prisma.trainingSessionExercise.findFirst.mockResolvedValue({
      ...sessionExerciseRecord,
      trainingSessionDay: {
        trainingSession: { ...sessionRecord, status: TrainingSessionStatus.COMPLETED },
      },
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.updateSessionExercise(trainer as never, sessionExerciseRecord.id, {
        actualSets: 4,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.trainingSessionExercise.update).not.toHaveBeenCalled();
  });

  it('rejects exercise edits for exercises outside sessions owned by the trainer', async () => {
    prisma.trainingSessionExercise.findFirst.mockResolvedValue(null);
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.updateSessionExercise(trainer as never, 'other-exercise', { actualSets: 4 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects private exercise edits when the training day is already completed', async () => {
    prisma.trainingSessionExercise.findFirst.mockResolvedValue({
      ...sessionExerciseRecord,
      trainingSessionDay: {
        ...sessionRecord.days[0],
        completedAt: new Date('2026-01-03T00:00:00Z'),
        trainingSession: { ...sessionRecord, status: TrainingSessionStatus.IN_PROGRESS },
      },
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.updateSessionExercise(trainer as never, sessionExerciseRecord.id, {
        actualSets: 4,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.trainingSessionExercise.update).not.toHaveBeenCalled();
  });

  it('starts a new public session from a valid active link', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSession.findFirst.mockResolvedValue(null);
    tx.trainingSession.create.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    const service = new TrainingSessionsService(prisma as never);

    await service.startPublicSession(publicLinkActive.token);

    expect(tx.trainingSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: routineActive.tenantId,
          studentId: routineActive.studentId,
          trainerId: routineActive.trainerId,
          routineId: routineActive.id,
          routineVersionId: 'version-1',
          status: TrainingSessionStatus.IN_PROGRESS,
        }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_SESSION_CREATED,
        createdByUserId: routineActive.trainerId,
        metadata: expect.objectContaining({ source: 'public-link' }),
      }),
    });
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: StudentHistoryEventType.TRAINING_SESSION_STARTED }),
    });
  });

  it('resumes an existing in-progress public session instead of creating a duplicate', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSession.findFirst.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.IN_PROGRESS,
    });
    const service = new TrainingSessionsService(prisma as never);

    const result = await service.startPublicSession(publicLinkActive.token);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ id: sessionRecord.id }));
  });

  it('syncs a stale public session to the latest version when the routine was republished', async () => {
    const staleSession = {
      ...sessionRecord,
      routineVersionId: 'version-old',
      status: TrainingSessionStatus.IN_PROGRESS,
      days: sessionRecord.days.map((day) => ({
        ...day,
        completedAt: null,
        exercises: day.exercises.map((exercise) => ({
          ...exercise,
          completed: false,
          actualSets: null,
          actualRepetitions: null,
          actualLoad: null,
          actualRestSeconds: null,
          actualRir: null,
          actualRpe: null,
          trainerNotes: null,
        })),
      })),
    };
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSession.findFirst.mockResolvedValue(staleSession);
    tx.trainingSession.findUniqueOrThrow.mockResolvedValue({
      ...sessionRecord,
      routineVersionId: 'version-1',
      status: TrainingSessionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    const service = new TrainingSessionsService(prisma as never);

    await service.startPublicSession(publicLinkActive.token);

    expect(tx.trainingSession.update).toHaveBeenCalledWith({
      where: { id: staleSession.id },
      data: expect.objectContaining({
        routineVersionId: 'version-1',
        status: TrainingSessionStatus.IN_PROGRESS,
        completedAt: null,
        cancelledAt: null,
      }),
    });
    expect(tx.trainingSessionDay.deleteMany).toHaveBeenCalledWith({
      where: { trainingSessionId: staleSession.id, completedAt: null },
    });
    expect(tx.trainingSessionDay.create).toHaveBeenCalledTimes(1);
    expect(tx.trainingSession.create).not.toHaveBeenCalled();
  });

  it('keeps completed days intact and recreates only pending days when syncing a stale session', async () => {
    const staleSessionWithProgress = {
      ...sessionRecord,
      routineVersionId: 'version-old',
      status: TrainingSessionStatus.IN_PROGRESS,
      days: sessionRecord.days.map((day) => ({
        ...day,
        completedAt: new Date('2026-01-03T00:00:00Z'),
        exercises: day.exercises.map((exercise) => ({
          ...exercise,
          completed: true,
          actualSets: exercise.id === sessionExerciseRecord.id ? 3 : null,
          actualRepetitions: null,
          actualLoad: null,
          actualRestSeconds: null,
          actualRir: null,
          actualRpe: null,
          trainerNotes: null,
        })),
      })),
    };
    const latestSnapshot = {
      ...routineSnapshot,
      days: [
        ...routineSnapshot.days,
        {
          ...routineSnapshot.days[0],
          id: 'day-2',
          name: 'Dia 2',
          order: 2,
        },
      ],
    };
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.publicRoutineLink.findUnique.mockResolvedValue({
      ...publicLinkActive,
      routine: {
        ...routineActive,
        versions: [{ id: 'version-2', routineId: 'routine-1', version: 2, snapshot: latestSnapshot }],
      },
    });
    prisma.trainingSession.findFirst.mockResolvedValue(staleSessionWithProgress);
    tx.trainingSession.findUniqueOrThrow.mockResolvedValue(staleSessionWithProgress);
    const service = new TrainingSessionsService(prisma as never);

    await service.startPublicSession(publicLinkActive.token);

    expect(tx.trainingSession.update).toHaveBeenCalledWith({
      where: { id: staleSessionWithProgress.id },
      data: expect.objectContaining({ routineVersionId: 'version-2' }),
    });
    expect(tx.trainingSessionDay.deleteMany).toHaveBeenCalledWith({
      where: { trainingSessionId: staleSessionWithProgress.id, completedAt: null },
    });
    expect(tx.trainingSessionDay.create).toHaveBeenCalledTimes(1);
    expect(tx.trainingSessionDay.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        trainingSessionId: staleSessionWithProgress.id,
        name: 'Dia 2',
        order: 2,
      }),
    });
  });

  it('rejects an unknown public link token', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(null);
    const service = new TrainingSessionsService(prisma as never);

    await expect(service.startPublicSession('missing-token')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects a revoked public link', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue({
      ...publicLinkActive,
      status: 'REVOKED',
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(service.startPublicSession(publicLinkActive.token)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects starting a public session when the routine is not active', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue({
      ...publicLinkActive,
      routine: { ...routineActive, status: RoutineStatus.DRAFT },
    });
    prisma.trainingSession.findFirst.mockResolvedValue(null);
    const service = new TrainingSessionsService(prisma as never);

    await expect(service.startPublicSession(publicLinkActive.token)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns null from getPublicSession when there is no in-progress session', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSession.findFirst.mockResolvedValue(null);
    const service = new TrainingSessionsService(prisma as never);

    const result = await service.getPublicSession(publicLinkActive.token);

    expect(result).toBeNull();
  });

  it('updates exercise execution data via public link while in progress', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionExercise.findFirst.mockResolvedValue({
      ...sessionExerciseRecord,
      trainingSessionDay: {
        trainingSession: { ...sessionRecord, status: TrainingSessionStatus.IN_PROGRESS },
      },
    });
    tx.trainingSessionExercise.update.mockResolvedValue({
      ...sessionExerciseRecord,
      completed: true,
      actualLoad: '50kg',
    });
    const service = new TrainingSessionsService(prisma as never);

    await service.updatePublicSessionExercise(publicLinkActive.token, sessionExerciseRecord.id, {
      completed: true,
      actualLoad: '50kg',
    });

    expect(tx.trainingSessionExercise.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: sessionExerciseRecord.id },
        data: expect.objectContaining({ completed: true, actualLoad: '50kg' }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_SESSION_EXERCISE_UPDATED,
        metadata: expect.objectContaining({ source: 'public-link' }),
      }),
    });
  });

  it('rejects updating an exercise that does not belong to this link routine', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionExercise.findFirst.mockResolvedValue(null);
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.updatePublicSessionExercise(publicLinkActive.token, 'other-exercise', {
        actualSets: 4,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects updating a public session exercise when the session is not in progress', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionExercise.findFirst.mockResolvedValue({
      ...sessionExerciseRecord,
      trainingSessionDay: {
        trainingSession: { ...sessionRecord, status: TrainingSessionStatus.COMPLETED },
      },
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.updatePublicSessionExercise(publicLinkActive.token, sessionExerciseRecord.id, {
        actualSets: 4,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects public exercise edits when the training day is already completed', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionExercise.findFirst.mockResolvedValue({
      ...sessionExerciseRecord,
      trainingSessionDay: {
        ...sessionRecord.days[0],
        completedAt: new Date('2026-01-03T00:00:00Z'),
        trainingSession: { ...sessionRecord, status: TrainingSessionStatus.IN_PROGRESS },
      },
    });
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.updatePublicSessionExercise(publicLinkActive.token, sessionExerciseRecord.id, {
        actualSets: 4,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.trainingSessionExercise.update).not.toHaveBeenCalled();
  });

  it('completes a day and auto-completes the session when it was the only day', async () => {
    const sessionDayRecord = { ...sessionRecord.days[0], completedAt: null };
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue({
      ...sessionDayRecord,
      trainingSession: { ...sessionRecord, days: [sessionDayRecord] },
    });
    tx.trainingSession.findUniqueOrThrow.mockResolvedValue({
      ...sessionRecord,
      status: TrainingSessionStatus.COMPLETED,
      completedAt: new Date(),
    });
    const service = new TrainingSessionsService(prisma as never);

    await service.completePublicSessionDay(publicLinkActive.token, sessionDayRecord.id);

    expect(tx.trainingSessionDay.update).toHaveBeenCalledWith({
      where: { id: sessionDayRecord.id },
      data: expect.objectContaining({ completedAt: expect.any(Date) }),
    });
    expect(tx.trainingSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: sessionRecord.id },
        data: expect.objectContaining({ status: TrainingSessionStatus.COMPLETED }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_SESSION_COMPLETED,
        metadata: expect.objectContaining({ source: 'public-link' }),
      }),
    });
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_SESSION_DAY_COMPLETED,
        metadata: expect.objectContaining({ trainingSessionDayId: sessionDayRecord.id }),
      }),
    });
  });

  it('completes a day without auto-completing the session when other days remain pending', async () => {
    const sessionDayRecord = { ...sessionRecord.days[0], completedAt: null };
    const secondDay = { ...sessionDayRecord, id: 'session-day-2', order: 2, completedAt: null };
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue({
      ...sessionDayRecord,
      trainingSession: { ...sessionRecord, days: [sessionDayRecord, secondDay] },
    });
    tx.trainingSession.findUniqueOrThrow.mockResolvedValue(sessionRecord);
    const service = new TrainingSessionsService(prisma as never);

    await service.completePublicSessionDay(publicLinkActive.token, sessionDayRecord.id);

    expect(tx.trainingSessionDay.update).toHaveBeenCalledWith({
      where: { id: sessionDayRecord.id },
      data: expect.objectContaining({ completedAt: expect.any(Date) }),
    });
    expect(tx.trainingSession.update).not.toHaveBeenCalled();
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledTimes(1);
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: StudentHistoryEventType.TRAINING_SESSION_DAY_COMPLETED }),
    });
  });

  it('rejects completing a day that does not belong to an in-progress session of this routine', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(null);
    const service = new TrainingSessionsService(prisma as never);

    await expect(
      service.completePublicSessionDay(publicLinkActive.token, 'other-day'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
