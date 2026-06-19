import {
  RoutineStatus,
  StudentStatus,
  TrainingSessionStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  const trainer = {
    id: 'trainer-1',
    role: UserRole.TRAINER,
  };

  const admin = {
    id: 'admin-1',
    role: UserRole.ADMIN,
  };

  const prisma = {
    student: {
      count: jest.fn<() => Promise<number>>(),
    },
    routine: {
      count: jest.fn<() => Promise<number>>(),
    },
    trainingSession: {
      count: jest.fn<() => Promise<number>>(),
    },
    trainingFeedback: {
      aggregate: jest.fn<() => Promise<unknown>>(),
      count: jest.fn<() => Promise<number>>(),
      findMany: jest.fn<() => Promise<unknown[]>>(),
    },
    user: {
      count: jest.fn<() => Promise<number>>(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-06-11T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns trainer metrics scoped to own students', async () => {
    prisma.student.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2);
    prisma.routine.count.mockResolvedValueOnce(4);
    prisma.trainingSession.count.mockResolvedValueOnce(7);
    prisma.trainingFeedback.count.mockResolvedValueOnce(6).mockResolvedValueOnce(2);
    prisma.trainingFeedback.findMany.mockResolvedValueOnce([
      { studentId: 'student-1' },
      { studentId: 'student-2' },
    ]);
    prisma.trainingFeedback.aggregate.mockResolvedValueOnce({
      _avg: {
        difficultyScore: 7.25,
        energyScore: 6.75,
      },
    });
    const service = new DashboardService(prisma as never);

    await expect(service.getMetrics(trainer as never)).resolves.toEqual({
      role: UserRole.TRAINER,
      activeStudents: 3,
      totalStudents: 5,
      studentsCreatedThisMonth: 2,
      activeRoutines: 4,
      completedSessionsLast30Days: 7,
      feedbackLast30Days: 6,
      discomfortFeedbackLast30Days: 2,
      studentsWithDiscomfortLast30Days: 2,
      averageDifficultyLast30Days: 7.3,
      averageEnergyLast30Days: 6.8,
    });
    expect(prisma.student.count).toHaveBeenNthCalledWith(1, {
      where: {
        trainerId: trainer.id,
        status: StudentStatus.ACTIVE,
      },
    });
    expect(prisma.student.count).toHaveBeenNthCalledWith(2, {
      where: {
        trainerId: trainer.id,
      },
    });
    expect(prisma.student.count).toHaveBeenNthCalledWith(3, {
      where: {
        trainerId: trainer.id,
        createdAt: {
          gte: new Date('2026-06-01T03:00:00.000Z'),
        },
      },
    });
    expect(prisma.routine.count).toHaveBeenCalledWith({
      where: {
        trainerId: trainer.id,
        status: RoutineStatus.ACTIVE,
      },
    });
    expect(prisma.trainingSession.count).toHaveBeenCalledWith({
      where: {
        trainerId: trainer.id,
        status: TrainingSessionStatus.COMPLETED,
        completedAt: {
          gte: new Date('2026-05-12T12:00:00.000Z'),
        },
      },
    });
    expect(prisma.trainingFeedback.count).toHaveBeenNthCalledWith(1, {
      where: {
        trainerId: trainer.id,
        submittedAt: {
          gte: new Date('2026-05-12T12:00:00.000Z'),
        },
      },
    });
    expect(prisma.trainingFeedback.count).toHaveBeenNthCalledWith(2, {
      where: {
        trainerId: trainer.id,
        hadDiscomfort: true,
        submittedAt: {
          gte: new Date('2026-05-12T12:00:00.000Z'),
        },
      },
    });
  });

  it('returns admin metrics across platform records', async () => {
    prisma.user.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(5);
    prisma.student.count.mockResolvedValueOnce(20).mockResolvedValueOnce(6);
    prisma.routine.count.mockResolvedValueOnce(8);
    prisma.trainingSession.count.mockResolvedValueOnce(11);
    prisma.trainingFeedback.count.mockResolvedValueOnce(9).mockResolvedValueOnce(3);
    const service = new DashboardService(prisma as never);

    await expect(service.getMetrics(admin as never)).resolves.toEqual({
      role: UserRole.ADMIN,
      pendingTrainers: 1,
      activeTrainers: 4,
      totalTrainers: 5,
      totalStudents: 20,
      studentsCreatedThisMonth: 6,
      activeRoutines: 8,
      completedSessionsLast30Days: 11,
      feedbackLast30Days: 9,
      discomfortFeedbackLast30Days: 3,
    });
    expect(prisma.user.count).toHaveBeenNthCalledWith(1, {
      where: {
        role: UserRole.TRAINER,
        status: UserStatus.PENDING_APPROVAL,
      },
    });
    expect(prisma.user.count).toHaveBeenNthCalledWith(2, {
      where: {
        role: UserRole.TRAINER,
        status: UserStatus.ACTIVE,
      },
    });
    expect(prisma.user.count).toHaveBeenNthCalledWith(3, {
      where: {
        role: UserRole.TRAINER,
      },
    });
    expect(prisma.student.count).toHaveBeenNthCalledWith(1);
    expect(prisma.student.count).toHaveBeenNthCalledWith(2, {
      where: {
        createdAt: {
          gte: new Date('2026-06-01T03:00:00.000Z'),
        },
      },
    });
    expect(prisma.routine.count).toHaveBeenCalledWith({
      where: {
        status: RoutineStatus.ACTIVE,
      },
    });
    expect(prisma.trainingSession.count).toHaveBeenCalledWith({
      where: {
        status: TrainingSessionStatus.COMPLETED,
        completedAt: {
          gte: new Date('2026-05-12T12:00:00.000Z'),
        },
      },
    });
    expect(prisma.trainingFeedback.count).toHaveBeenNthCalledWith(1, {
      where: {
        submittedAt: {
          gte: new Date('2026-05-12T12:00:00.000Z'),
        },
      },
    });
    expect(prisma.trainingFeedback.count).toHaveBeenNthCalledWith(2, {
      where: {
        hadDiscomfort: true,
        submittedAt: {
          gte: new Date('2026-05-12T12:00:00.000Z'),
        },
      },
    });
  });
});
