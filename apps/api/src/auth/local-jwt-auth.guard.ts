import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RequestWithUser } from './current-user';
import { TokenService } from './token.service';

@Injectable()
export class LocalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers?.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('Bearer token is required.');
    }

    const payload = this.tokenService.verify(token);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    request.localUser = user;
    request.user = {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    return true;
  }
}
