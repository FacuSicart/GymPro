import { Injectable } from '@nestjs/common';
import {
  RoutineStatus,
  StudentStatus,
  TrainingSessionStatus,
  User,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(user: User) {
    const monthStart = this.getCurrentMonthStart();
    const last30DaysStart = this.getLast30DaysStart();

    switch (user.role) {
      case UserRole.ADMIN:
        return this.getAdminMetrics(monthStart, last30DaysStart);
      case UserRole.TRAINER:
        return this.getTrainerMetrics(user, monthStart, last30DaysStart);
    }
  }

  private async getTrainerMetrics(
    user: User,
    monthStart: Date,
    last30DaysStart: Date,
  ) {
    const [
      activeStudents,
      totalStudents,
      studentsCreatedThisMonth,
      activeRoutines,
      completedSessionsLast30Days,
      feedbackLast30Days,
      discomfortFeedbackLast30Days,
      studentsWithDiscomfortRows,
      feedbackAverages,
    ] = await Promise.all([
        this.prisma.student.count({
          where: {
            trainerId: user.id,
            status: StudentStatus.ACTIVE,
          },
        }),
        this.prisma.student.count({
          where: {
            trainerId: user.id,
          },
        }),
        this.prisma.student.count({
          where: {
            trainerId: user.id,
            createdAt: {
              gte: monthStart,
            },
          },
        }),
        this.prisma.routine.count({
          where: {
            trainerId: user.id,
            status: RoutineStatus.ACTIVE,
          },
        }),
        this.prisma.trainingSession.count({
          where: {
            trainerId: user.id,
            status: TrainingSessionStatus.COMPLETED,
            completedAt: {
              gte: last30DaysStart,
            },
          },
        }),
        this.prisma.trainingFeedback.count({
          where: {
            trainerId: user.id,
            submittedAt: {
              gte: last30DaysStart,
            },
          },
        }),
        this.prisma.trainingFeedback.count({
          where: {
            trainerId: user.id,
            hadDiscomfort: true,
            submittedAt: {
              gte: last30DaysStart,
            },
          },
        }),
        this.prisma.trainingFeedback.findMany({
          where: {
            trainerId: user.id,
            hadDiscomfort: true,
            submittedAt: {
              gte: last30DaysStart,
            },
          },
          distinct: ['studentId'],
          select: { studentId: true },
        }),
        this.prisma.trainingFeedback.aggregate({
          where: {
            trainerId: user.id,
            submittedAt: {
              gte: last30DaysStart,
            },
          },
          _avg: {
            difficultyScore: true,
            energyScore: true,
          },
        }),
      ]);

    return {
      role: UserRole.TRAINER,
      activeStudents,
      totalStudents,
      studentsCreatedThisMonth,
      activeRoutines,
      completedSessionsLast30Days,
      feedbackLast30Days,
      discomfortFeedbackLast30Days,
      studentsWithDiscomfortLast30Days: studentsWithDiscomfortRows.length,
      averageDifficultyLast30Days: this.roundOneDecimal(
        feedbackAverages._avg.difficultyScore,
      ),
      averageEnergyLast30Days: this.roundOneDecimal(
        feedbackAverages._avg.energyScore,
      ),
    };
  }

  private async getAdminMetrics(monthStart: Date, last30DaysStart: Date) {
    const [
      pendingTrainers,
      activeTrainers,
      totalTrainers,
      totalStudents,
      studentsCreatedThisMonth,
      activeRoutines,
      completedSessionsLast30Days,
      feedbackLast30Days,
      discomfortFeedbackLast30Days,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: UserRole.TRAINER,
          status: UserStatus.PENDING_APPROVAL,
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.TRAINER,
          status: UserStatus.ACTIVE,
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.TRAINER,
        },
      }),
      this.prisma.student.count(),
      this.prisma.student.count({
        where: {
          createdAt: {
            gte: monthStart,
          },
        },
      }),
      this.prisma.routine.count({
        where: {
          status: RoutineStatus.ACTIVE,
        },
      }),
      this.prisma.trainingSession.count({
        where: {
          status: TrainingSessionStatus.COMPLETED,
          completedAt: {
            gte: last30DaysStart,
          },
        },
      }),
      this.prisma.trainingFeedback.count({
        where: {
          submittedAt: {
            gte: last30DaysStart,
          },
        },
      }),
      this.prisma.trainingFeedback.count({
        where: {
          hadDiscomfort: true,
          submittedAt: {
            gte: last30DaysStart,
          },
        },
      }),
    ]);

    return {
      role: UserRole.ADMIN,
      pendingTrainers,
      activeTrainers,
      totalTrainers,
      totalStudents,
      studentsCreatedThisMonth,
      activeRoutines,
      completedSessionsLast30Days,
      feedbackLast30Days,
      discomfortFeedbackLast30Days,
    };
  }

  private getCurrentMonthStart() {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private getLast30DaysStart() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 30);

    return start;
  }

  private roundOneDecimal(value: number | null | undefined) {
    if (value == null) {
      return null;
    }

    return Math.round(value * 10) / 10;
  }
}
