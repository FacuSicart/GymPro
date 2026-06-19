import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const activeTrainer = {
    id: 'trainer-1',
    tenantId: 'tenant-1',
    firstName: 'Sofia',
    lastName: 'Garcia',
    email: 'trainer@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.TRAINER,
    status: UserStatus.ACTIVE,
  };

  const prisma = {
    user: {
      findUnique: jest.fn<() => Promise<unknown>>(),
      findFirst: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => Promise<unknown>>(),
    },
    tenant: {
      create: jest.fn<() => Promise<{ id: string }>>(),
    },
  };
  const passwordService = {
    hash: jest.fn<() => Promise<string>>(),
    verify: jest.fn<() => Promise<boolean>>(),
  };
  const tokenService = {
    sign: jest.fn<() => string>(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    passwordService.hash.mockResolvedValue('hashed-password');
    tokenService.sign.mockReturnValue('local-token');
  });

  it('logs in active local users and issues a token', async () => {
    prisma.user.findUnique.mockResolvedValue(activeTrainer);
    passwordService.verify.mockResolvedValue(true);
    const service = new AuthService(
      prisma as never,
      passwordService,
      tokenService as never,
    );

    await expect(
      service.login({
        email: 'TRAINER@example.com',
        password: 'Password123',
      }),
    ).resolves.toMatchObject({
      accessToken: 'local-token',
      canAccessInternalApp: true,
      user: {
        id: activeTrainer.id,
        email: activeTrainer.email,
        status: UserStatus.ACTIVE,
      },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: activeTrainer.email },
    });
    expect(passwordService.verify).toHaveBeenCalledWith(
      'Password123',
      activeTrainer.passwordHash,
    );
    expect(tokenService.sign).toHaveBeenCalledWith({
      sub: activeTrainer.id,
      email: activeTrainer.email,
      role: activeTrainer.role,
      status: activeTrainer.status,
    });
  });

  it('blocks login with invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(activeTrainer);
    passwordService.verify.mockResolvedValue(false);
    const service = new AuthService(
      prisma as never,
      passwordService,
      tokenService as never,
    );

    await expect(
      service.login({
        email: activeTrainer.email,
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tokenService.sign).not.toHaveBeenCalled();
  });

  it('returns the current profile and access flag', async () => {
    prisma.user.findUnique.mockResolvedValue(activeTrainer);
    const service = new AuthService(
      prisma as never,
      passwordService,
      tokenService as never,
    );

    await expect(
      service.getProfile({
        userId: activeTrainer.id,
        email: activeTrainer.email,
      }),
    ).resolves.toMatchObject({
      auth: {
        userId: activeTrainer.id,
        email: activeTrainer.email,
      },
      user: {
        id: activeTrainer.id,
        status: UserStatus.ACTIVE,
      },
      canAccessInternalApp: true,
    });
  });

  it('registers a public trainer as pending approval', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.tenant.create.mockResolvedValue({ id: 'tenant-1' });
    prisma.user.create.mockResolvedValue({
      role: UserRole.TRAINER,
      status: UserStatus.PENDING_APPROVAL,
    });

    const service = new AuthService(
      prisma as never,
      passwordService,
      tokenService as never,
    );

    await service.registerTrainer({
      firstName: 'Sofia',
      lastName: 'Garcia',
      email: 'trainer@example.com',
      password: 'Password123',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        passwordHash: 'hashed-password',
        firstName: 'Sofia',
        lastName: 'Garcia',
        email: 'trainer@example.com',
        role: UserRole.TRAINER,
        status: UserStatus.PENDING_APPROVAL,
      },
    });
  });

  it('rejects duplicate local users during trainer signup', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    const service = new AuthService(
      prisma as never,
      passwordService,
      tokenService as never,
    );

    await expect(
      service.registerTrainer({
        firstName: 'Sofia',
        lastName: 'Garcia',
        email: 'trainer@example.com',
        password: 'Password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
