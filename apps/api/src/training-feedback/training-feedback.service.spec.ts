import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StudentHistoryEventType } from '@prisma/client';
import { TrainingFeedbackService } from './training-feedback.service';

describe('TrainingFeedbackService', () => {
  const admin = { id: 'admin-1', tenantId: 'admin-tenant', role: 'ADMIN' };

  const routineActive = {
    id: 'routine-1',
    tenantId: 'tenant-1',
    studentId: 'student-1',
    trainerId: 'trainer-1',
    name: 'Rutina Fuerza',
  };

  const publicLinkActive = {
    id: 'link-1',
    routineId: routineActive.id,
    token: 'public-token',
    status: 'ACTIVE',
    routine: routineActive,
  };

  const parentSession = {
    id: 'session-1',
    tenantId: 'tenant-1',
    studentId: 'student-1',
    trainerId: 'trainer-1',
    routineId: routineActive.id,
    routineVersionId: 'version-1',
    status: 'COMPLETED',
  };

  const completedDay = {
    id: 'day-1',
    trainingSessionId: parentSession.id,
    name: 'Dia 1',
    order: 1,
    completedAt: new Date('2026-01-01T00:00:00Z'),
    trainingSession: parentSession,
  };

  const baseDto = {
    difficultyScore: 7,
    energyScore: 6,
    completedWorkout: true,
    hadDiscomfort: false,
  };

  const tx = {
    trainingFeedback: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    studentHistoryEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const prisma = {
    student: {
      findFirst: jest.fn(),
    },
    publicRoutineLink: {
      findUnique: jest.fn(),
    },
    trainingSessionDay: {
      findFirst: jest.fn(),
    },
    trainingFeedback: {
      findMany: jest.fn(),
    },
    trainingSession: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    tx.trainingFeedback.findMany.mockResolvedValue([]);
    tx.studentHistoryEvent.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    );
  });

  it('creates feedback from the latest completed day without feedback and writes submitted + discomfort events', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(completedDay);
    tx.trainingFeedback.create.mockResolvedValue({
      id: 'feedback-1',
      difficultyScore: 7,
      energyScore: 6,
      hadDiscomfort: true,
      discomfortArea: 'Hombro',
      submittedAt: new Date('2026-01-02T00:00:00Z'),
    });
    const service = new TrainingFeedbackService(prisma as never);

    const result = await service.createPublicFeedback(publicLinkActive.token, {
      ...baseDto,
      hadDiscomfort: true,
      discomfortArea: 'Hombro',
      discomfortIntensity: 4,
    });

    expect(prisma.trainingSessionDay.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          trainingSession: { routineId: routineActive.id },
          completedAt: { not: null },
          feedback: null,
        }),
      }),
    );
    expect(tx.trainingFeedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: routineActive.tenantId,
          studentId: routineActive.studentId,
          trainerId: routineActive.trainerId,
          routineId: routineActive.id,
          routineVersionId: parentSession.routineVersionId,
          trainingSessionId: parentSession.id,
          trainingSessionDayId: completedDay.id,
          publicRoutineLinkId: publicLinkActive.id,
          hadDiscomfort: true,
          discomfortArea: 'Hombro',
          discomfortIntensity: 4,
        }),
      }),
    );
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_FEEDBACK_SUBMITTED,
        metadata: expect.objectContaining({ source: 'public-link', trainingSessionDayId: completedDay.id }),
      }),
    });
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_FEEDBACK_DISCOMFORT_REPORTED,
      }),
    });
    expect(result).toEqual({ pending: false, submittedAt: expect.any(Date), dayName: completedDay.name });
  });

  it('writes only the submitted event when there was no discomfort', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(completedDay);
    tx.trainingFeedback.create.mockResolvedValue({
      id: 'feedback-1',
      difficultyScore: 7,
      energyScore: 6,
      hadDiscomfort: false,
      submittedAt: new Date(),
    });
    const service = new TrainingFeedbackService(prisma as never);

    await service.createPublicFeedback(publicLinkActive.token, baseDto);

    expect(tx.studentHistoryEvent.create).toHaveBeenCalledTimes(1);
    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: StudentHistoryEventType.TRAINING_FEEDBACK_SUBMITTED }),
    });
  });

  it('sanitizes discomfort fields to null when hadDiscomfort is false even if provided', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(completedDay);
    tx.trainingFeedback.create.mockResolvedValue({
      id: 'feedback-1',
      hadDiscomfort: false,
      submittedAt: new Date(),
    });
    const service = new TrainingFeedbackService(prisma as never);

    await service.createPublicFeedback(publicLinkActive.token, {
      ...baseDto,
      hadDiscomfort: false,
      discomfortArea: 'Rodilla',
      discomfortIntensity: 8,
      discomfortDescription: 'deberia ignorarse',
    });

    expect(tx.trainingFeedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discomfortArea: null,
          discomfortIntensity: null,
          discomfortDescription: null,
        }),
      }),
    );
  });

  it('sanitizes incompleteReason to null when completedWorkout is true even if provided', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(completedDay);
    tx.trainingFeedback.create.mockResolvedValue({
      id: 'feedback-1',
      hadDiscomfort: false,
      submittedAt: new Date(),
    });
    const service = new TrainingFeedbackService(prisma as never);

    await service.createPublicFeedback(publicLinkActive.token, {
      ...baseDto,
      completedWorkout: true,
      incompleteReason: 'deberia ignorarse',
    });

    expect(tx.trainingFeedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ incompleteReason: null }),
      }),
    );
  });

  it('rejects when there is no completed day pending feedback', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(null);
    const service = new TrainingFeedbackService(prisma as never);

    await expect(
      service.createPublicFeedback(publicLinkActive.token, baseDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unknown public link token', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(null);
    const service = new TrainingFeedbackService(prisma as never);

    await expect(
      service.createPublicFeedback('missing-token', baseDto),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a revoked public link', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue({
      ...publicLinkActive,
      status: 'REVOKED',
    });
    const service = new TrainingFeedbackService(prisma as never);

    await expect(
      service.createPublicFeedback(publicLinkActive.token, baseDto),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('converts a unique constraint violation into a ConflictException', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(completedDay);
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.8.0',
      }),
    );
    const service = new TrainingFeedbackService(prisma as never);

    await expect(
      service.createPublicFeedback(publicLinkActive.token, baseDto),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('getPublicFeedbackStatus returns pending true with the day name when a completed day has no feedback yet', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(completedDay);
    const service = new TrainingFeedbackService(prisma as never);

    const result = await service.getPublicFeedbackStatus(publicLinkActive.token);

    expect(result).toEqual({ pending: true, dayName: completedDay.name });
  });

  it('getPublicFeedbackStatus returns null when nothing is pending', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(null);
    const service = new TrainingFeedbackService(prisma as never);

    const result = await service.getPublicFeedbackStatus(publicLinkActive.token);

    expect(result).toBeNull();
  });

  it('treats each day as independently pending: submitting Dia 1 feedback does not affect Dia 2', async () => {
    const day2 = { ...completedDay, id: 'day-2', name: 'Dia 2' };
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValueOnce(completedDay);
    tx.trainingFeedback.create.mockResolvedValue({
      id: 'feedback-1',
      hadDiscomfort: false,
      submittedAt: new Date(),
    });
    const service = new TrainingFeedbackService(prisma as never);

    await service.createPublicFeedback(publicLinkActive.token, baseDto);
    expect(tx.trainingFeedback.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trainingSessionDayId: completedDay.id }) }),
    );

    prisma.trainingSessionDay.findFirst.mockResolvedValueOnce(day2);
    await service.createPublicFeedback(publicLinkActive.token, baseDto);
    expect(tx.trainingFeedback.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trainingSessionDayId: day2.id }) }),
    );
  });

  it('listBySession returns one feedback entry per completed day', async () => {
    const trainer = { id: 'trainer-1', tenantId: 'tenant-1', role: 'TRAINER' };
    prisma.trainingSession.findFirst.mockResolvedValue({ id: parentSession.id, trainerId: 'trainer-1' });
    prisma.trainingFeedback.findMany.mockResolvedValue([
      { id: 'feedback-1', trainingSessionDayId: 'day-1', student: {}, routine: {}, trainingSessionDay: { id: 'day-1', name: 'Dia 1', order: 1 } },
      { id: 'feedback-2', trainingSessionDayId: 'day-2', student: {}, routine: {}, trainingSessionDay: { id: 'day-2', name: 'Dia 2', order: 2 } },
    ]);
    const service = new TrainingFeedbackService(prisma as never);

    const result = await service.listBySession(trainer as never, parentSession.id);

    expect(result).toHaveLength(2);
    expect(prisma.trainingFeedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { trainingSessionId: parentSession.id } }),
    );
  });

  it('allows admins to list feedback across trainer tenants', async () => {
    prisma.trainingFeedback.findMany.mockResolvedValue([]);
    const service = new TrainingFeedbackService(prisma as never);

    await service.listFeedback(admin as never, { studentId: 'student-1' });

    expect(prisma.trainingFeedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { studentId: 'student-1' },
      }),
    );
  });

  it('allows admins to list feedback by any accessible student', async () => {
    prisma.student.findFirst.mockResolvedValue({ id: 'student-1' });
    prisma.trainingFeedback.findMany.mockResolvedValue([]);
    const service = new TrainingFeedbackService(prisma as never);

    await service.listByStudent(admin as never, 'student-1');

    expect(prisma.student.findFirst).toHaveBeenCalledWith({
      where: { id: 'student-1' },
    });
    expect(prisma.trainingFeedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { studentId: 'student-1' },
      }),
    );
  });

  it('listRecurrentDiscomforts returns zones with at least 3 reports in the last 30 days', async () => {
    const trainer = { id: 'trainer-1', tenantId: 'tenant-1', role: 'TRAINER' };
    prisma.student.findFirst.mockResolvedValue({ id: routineActive.studentId });
    prisma.trainingFeedback.findMany.mockResolvedValue([
      {
        id: 'feedback-3',
        discomfortArea: 'Rodilla',
        discomfortIntensity: 7,
        discomfortDescription: 'Molestia al final',
        submittedAt: new Date('2026-01-10T00:00:00Z'),
      },
      {
        id: 'feedback-2',
        discomfortArea: 'rodilla ',
        discomfortIntensity: 5,
        discomfortDescription: null,
        submittedAt: new Date('2026-01-08T00:00:00Z'),
      },
      {
        id: 'feedback-1',
        discomfortArea: 'Rodilla',
        discomfortIntensity: 4,
        discomfortDescription: 'Carga pesada',
        submittedAt: new Date('2026-01-01T00:00:00Z'),
      },
      {
        id: 'feedback-4',
        discomfortArea: 'Hombro',
        discomfortIntensity: 3,
        discomfortDescription: null,
        submittedAt: new Date('2026-01-09T00:00:00Z'),
      },
    ]);
    const service = new TrainingFeedbackService(prisma as never);

    const result = await service.listRecurrentDiscomforts(
      trainer as never,
      routineActive.studentId,
    );

    expect(result).toEqual([
      {
        area: 'Rodilla',
        areaKey: 'rodilla',
        reportCount: 3,
        averageIntensity: 5.3,
        maxIntensity: 7,
        lastReportedAt: new Date('2026-01-10T00:00:00Z'),
        recentComments: ['Molestia al final', 'Carga pesada'],
        feedbackIds: ['feedback-3', 'feedback-2', 'feedback-1'],
      },
    ]);
  });

  it('creates a recurrent discomfort history event when a zone reaches 3 reports', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(completedDay);
    tx.trainingFeedback.create.mockResolvedValue({
      id: 'feedback-3',
      difficultyScore: 7,
      energyScore: 6,
      hadDiscomfort: true,
      discomfortArea: 'Rodilla',
      discomfortIntensity: 6,
      discomfortDescription: 'Se repite',
      submittedAt: new Date('2026-01-10T00:00:00Z'),
    });
    tx.trainingFeedback.findMany.mockResolvedValue([
      {
        id: 'feedback-3',
        discomfortArea: 'Rodilla',
        discomfortIntensity: 6,
        discomfortDescription: 'Se repite',
        submittedAt: new Date('2026-01-10T00:00:00Z'),
      },
      {
        id: 'feedback-2',
        discomfortArea: 'rodilla',
        discomfortIntensity: 5,
        discomfortDescription: null,
        submittedAt: new Date('2026-01-05T00:00:00Z'),
      },
      {
        id: 'feedback-1',
        discomfortArea: 'Rodilla',
        discomfortIntensity: 4,
        discomfortDescription: null,
        submittedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ]);
    const service = new TrainingFeedbackService(prisma as never);

    await service.createPublicFeedback(publicLinkActive.token, {
      ...baseDto,
      hadDiscomfort: true,
      discomfortArea: 'Rodilla',
      discomfortIntensity: 6,
    });

    expect(tx.studentHistoryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_FEEDBACK_RECURRENT_DISCOMFORT_DETECTED,
        metadata: expect.objectContaining({
          discomfortArea: 'Rodilla',
          discomfortAreaKey: 'rodilla',
          reportCount: 3,
          trainingFeedbackId: 'feedback-3',
        }),
      }),
    });
  });

  it('does not duplicate recurrent discomfort events for the same zone in the recent window', async () => {
    prisma.publicRoutineLink.findUnique.mockResolvedValue(publicLinkActive);
    prisma.trainingSessionDay.findFirst.mockResolvedValue(completedDay);
    tx.trainingFeedback.create.mockResolvedValue({
      id: 'feedback-3',
      difficultyScore: 7,
      energyScore: 6,
      hadDiscomfort: true,
      discomfortArea: 'Rodilla',
      discomfortIntensity: 6,
      submittedAt: new Date('2026-01-10T00:00:00Z'),
    });
    tx.trainingFeedback.findMany.mockResolvedValue([
      {
        id: 'feedback-3',
        discomfortArea: 'Rodilla',
        discomfortIntensity: 6,
        discomfortDescription: null,
        submittedAt: new Date('2026-01-10T00:00:00Z'),
      },
      {
        id: 'feedback-2',
        discomfortArea: 'Rodilla',
        discomfortIntensity: 5,
        discomfortDescription: null,
        submittedAt: new Date('2026-01-05T00:00:00Z'),
      },
      {
        id: 'feedback-1',
        discomfortArea: 'Rodilla',
        discomfortIntensity: 4,
        discomfortDescription: null,
        submittedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ]);
    tx.studentHistoryEvent.findMany.mockResolvedValue([
      { metadata: { discomfortAreaKey: 'rodilla' } },
    ]);
    const service = new TrainingFeedbackService(prisma as never);

    await service.createPublicFeedback(publicLinkActive.token, {
      ...baseDto,
      hadDiscomfort: true,
      discomfortArea: 'Rodilla',
      discomfortIntensity: 6,
    });

    expect(tx.studentHistoryEvent.create).not.toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: StudentHistoryEventType.TRAINING_FEEDBACK_RECURRENT_DISCOMFORT_DETECTED,
      }),
    });
  });
});
