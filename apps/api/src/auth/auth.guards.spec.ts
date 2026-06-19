import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, UserStatus } from '@prisma/client';
import { ActiveUserGuard } from './active-user.guard';
import { LocalJwtAuthGuard } from './local-jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

type RequestMock = {
  headers?: { authorization?: string };
  user?: unknown;
  localUser?: unknown;
};

function createContext(request: RequestMock) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };
}

describe('Auth guards', () => {
  const activeAdmin = {
    id: 'admin-1',
    tenantId: 'tenant-1',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  };

  it('loads the local user from a bearer token', async () => {
    const request: RequestMock = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(activeAdmin),
      },
    };
    const tokenService = {
      verify: jest.fn().mockReturnValue({ sub: activeAdmin.id }),
    };
    const guard = new LocalJwtAuthGuard(prisma as never, tokenService as never);

    await expect(
      guard.canActivate(createContext(request) as never),
    ).resolves.toBe(true);
    expect(request.localUser).toEqual(activeAdmin);
    expect(request.user).toMatchObject({
      userId: activeAdmin.id,
      email: activeAdmin.email,
      role: activeAdmin.role,
      tenantId: activeAdmin.tenantId,
    });
  });

  it('rejects requests without bearer token', async () => {
    const guard = new LocalJwtAuthGuard({} as never, {} as never);

    await expect(
      guard.canActivate(createContext({}) as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('blocks inactive users from active-only routes', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          ...activeAdmin,
          status: UserStatus.PENDING_APPROVAL,
        }),
      },
    };
    const guard = new ActiveUserGuard(prisma as never);

    await expect(
      guard.canActivate(
        createContext({ user: { userId: activeAdmin.id } }) as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows active users through active-only routes', async () => {
    const request: RequestMock = { user: { userId: activeAdmin.id } };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(activeAdmin),
      },
    };
    const guard = new ActiveUserGuard(prisma as never);

    await expect(
      guard.canActivate(createContext(request) as never),
    ).resolves.toBe(true);
    expect(request.localUser).toEqual(activeAdmin);
  });

  it('enforces role metadata', () => {
    class Controller {
      @Roles(UserRole.ADMIN)
      route() {
        return undefined;
      }
    }

    const controller = new Controller();
    const handler = controller.route;
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate({
        ...createContext({ localUser: activeAdmin }),
        getHandler: () => handler,
        getClass: () => Controller,
      } as never),
    ).toBe(true);
    expect(() =>
      guard.canActivate({
        ...createContext({
          localUser: { ...activeAdmin, role: UserRole.TRAINER },
        }),
        getHandler: () => handler,
        getClass: () => Controller,
      } as never),
    ).toThrow(ForbiddenException);
  });
});
