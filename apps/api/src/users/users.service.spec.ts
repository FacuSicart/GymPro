import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const admin = {
    id: 'admin-1',
    tenantId: 'tenant-1',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  };

  const pendingTrainer = {
    id: 'trainer-1',
    tenantId: 'tenant-2',
    role: UserRole.TRAINER,
    status: UserStatus.PENDING_APPROVAL,
  };

  const prisma = {
    user: {
      findMany: jest.fn<() => Promise<unknown[]>>(),
      findFirst: jest.fn<() => Promise<unknown>>(),
      update: jest.fn<() => Promise<unknown>>(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lists all trainers for admin overview', async () => {
    prisma.user.findMany.mockResolvedValue([pendingTrainer]);
    const service = new UsersService(prisma as never);

    await expect(service.listTrainers()).resolves.toEqual([pendingTrainer]);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        role: UserRole.TRAINER,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip: 0,
      take: 100,
    });
  });

  it('lists active trainers when status is provided', async () => {
    const activeTrainer = {
      ...pendingTrainer,
      status: UserStatus.ACTIVE,
    };
    prisma.user.findMany.mockResolvedValue([activeTrainer]);
    const service = new UsersService(prisma as never);

    await expect(service.listTrainers(UserStatus.ACTIVE)).resolves.toEqual([
      activeTrainer,
    ]);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        role: UserRole.TRAINER,
        status: UserStatus.ACTIVE,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip: 0,
      take: 100,
    });
  });

  it('rejects invalid trainer status filters', async () => {
    const service = new UsersService(prisma as never);

    await expect(service.listTrainers('UNKNOWN')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('lists pending trainers for admin review', async () => {
    prisma.user.findMany.mockResolvedValue([pendingTrainer]);
    const service = new UsersService(prisma as never);

    await expect(service.listPendingTrainers(admin as never)).resolves.toEqual([
      pendingTrainer,
    ]);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        role: UserRole.TRAINER,
        status: UserStatus.PENDING_APPROVAL,
      },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('approves pending trainers as active', async () => {
    prisma.user.findFirst.mockResolvedValue(pendingTrainer);
    prisma.user.update.mockResolvedValue({
      ...pendingTrainer,
      status: UserStatus.ACTIVE,
    });
    const service = new UsersService(prisma as never);

    await service.approveTrainer(admin as never, pendingTrainer.id);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: pendingTrainer.id },
      data: {
        status: UserStatus.ACTIVE,
        approvedAt: expect.any(Date) as Date,
        approvedByUserId: admin.id,
        rejectedAt: null,
        rejectedByUserId: null,
        rejectionReason: null,
      },
    });
  });

  it('rejects pending trainers', async () => {
    prisma.user.findFirst.mockResolvedValue(pendingTrainer);
    prisma.user.update.mockResolvedValue({
      ...pendingTrainer,
      status: UserStatus.REJECTED,
    });
    const service = new UsersService(prisma as never);

    await service.rejectTrainer(admin as never, pendingTrainer.id, 'No fit');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: pendingTrainer.id },
      data: {
        status: UserStatus.REJECTED,
        rejectedAt: expect.any(Date) as Date,
        rejectedByUserId: admin.id,
        rejectionReason: 'No fit',
      },
    });
  });

  it('deactivates active trainers virtually', async () => {
    const activeTrainer = {
      ...pendingTrainer,
      status: UserStatus.ACTIVE,
    };
    prisma.user.findFirst.mockResolvedValue(activeTrainer);
    prisma.user.update.mockResolvedValue({
      ...activeTrainer,
      status: UserStatus.DEACTIVATED,
    });
    const service = new UsersService(prisma as never);

    await service.deactivateTrainer(admin as never, activeTrainer.id);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: activeTrainer.id },
      data: {
        status: UserStatus.DEACTIVATED,
      },
    });
  });

  it('does not deactivate trainers that are not active', async () => {
    prisma.user.findFirst.mockResolvedValue(pendingTrainer);
    const service = new UsersService(prisma as never);

    await expect(
      service.deactivateTrainer(admin as never, pendingTrainer.id),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('fails when trainer does not exist', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    const service = new UsersService(prisma as never);

    await expect(
      service.approveTrainer(admin as never, 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('fails when trainer is not pending approval', async () => {
    prisma.user.findFirst.mockResolvedValue({
      ...pendingTrainer,
      status: UserStatus.ACTIVE,
    });
    const service = new UsersService(prisma as never);

    await expect(
      service.rejectTrainer(admin as never, pendingTrainer.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
