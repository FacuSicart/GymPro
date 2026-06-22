import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import type { Prisma, User } from '@prisma/client';
import { paginationArgs, PaginationQueryDto } from '../common/pagination-query.dto';
import { PrismaService } from '../database/prisma.service';
import { toPublicUser, toPublicUsers } from './user-presenter';

type TrainerModerationAction = 'approve' | 'reject';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listTrainers(status?: string, query: PaginationQueryDto = {}) {
    const where: Prisma.UserWhereInput = {
      role: UserRole.TRAINER,
    };

    if (status) {
      if (!this.isUserStatus(status)) {
        throw new BadRequestException('Invalid trainer status.');
      }

      where.status = status;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      ...paginationArgs(query),
    });

    return toPublicUsers(users);
  }

  async listPendingTrainers(admin: User) {
    void admin;

    const users = await this.prisma.user.findMany({
      where: {
        role: UserRole.TRAINER,
        status: UserStatus.PENDING_APPROVAL,
      },
      orderBy: { createdAt: 'asc' },
    });

    return toPublicUsers(users);
  }

  async approveTrainer(admin: User, userId: string) {
    return this.moderatePendingTrainer(admin, userId, 'approve');
  }

  async rejectTrainer(admin: User, userId: string, reason?: string) {
    return this.moderatePendingTrainer(admin, userId, 'reject', reason);
  }

  async deactivateTrainer(admin: User, userId: string) {
    void admin;
    const user = await this.findTrainer(userId);

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Only active trainers can be deactivated.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.DEACTIVATED,
      },
    });

    return toPublicUser(updatedUser);
  }

  private async moderatePendingTrainer(
    admin: User,
    userId: string,
    action: TrainerModerationAction,
    reason?: string,
  ) {
    const user = await this.findPendingTrainer(userId);
    const now = new Date();
    let data: Prisma.UserUncheckedUpdateInput;

    switch (action) {
      case 'approve':
        data = {
          status: UserStatus.ACTIVE,
          approvedAt: now,
          approvedByUserId: admin.id,
          rejectedAt: null,
          rejectedByUserId: null,
          rejectionReason: null,
        };
        break;
      case 'reject':
        data = {
          status: UserStatus.REJECTED,
          rejectedAt: now,
          rejectedByUserId: admin.id,
          rejectionReason: reason,
        };
        break;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });

    return toPublicUser(updatedUser);
  }

  private async findPendingTrainer(userId: string) {
    const user = await this.findTrainer(userId);

    if (user.status !== UserStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Trainer is not pending approval.');
    }

    return user;
  }

  private async findTrainer(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: UserRole.TRAINER,
      },
    });

    if (!user) {
      throw new NotFoundException('Trainer not found.');
    }

    return user;
  }

  private isUserStatus(status: string): status is UserStatus {
    return Object.values(UserStatus).includes(status as UserStatus);
  }
}
