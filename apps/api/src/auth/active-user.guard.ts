import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { RequestWithUser } from './current-user';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Authenticated user is required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User is not registered in this system.');
    }

    request.localUser = user;

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User is not active.');
    }

    return true;
  }
}
