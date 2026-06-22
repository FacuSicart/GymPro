import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export type AuthenticatedUser = {
  userId: string;
  email?: string;
  tenantId?: string;
  role?: string;
};

export type RequestWithUser = {
  headers?: {
    authorization?: string;
    cookie?: string;
  };
  user?: AuthenticatedUser;
  localUser?: User;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.localUser) {
      throw new Error('CurrentUser used without a loaded local user.');
    }

    return request.localUser;
  },
);
