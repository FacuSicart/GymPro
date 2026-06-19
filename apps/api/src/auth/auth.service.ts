import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from './current-user';
import { LoginDto } from './dto/login.dto';
import { TrainerSignupDto } from './dto/trainer-signup.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { toPublicUser } from '../users/user-presenter';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async getProfile(authenticatedUser: AuthenticatedUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: authenticatedUser.userId },
      include: { tenant: true },
    });

    return {
      auth: {
        userId: authenticatedUser.userId,
        email: authenticatedUser.email,
      },
      user: user ? toPublicUser(user) : null,
      canAccessInternalApp: user?.status === UserStatus.ACTIVE,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !(await this.passwordService.verify(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      accessToken: this.tokenService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      }),
      user: toPublicUser(user),
      canAccessInternalApp: user.status === UserStatus.ACTIVE,
    };
  }

  async registerTrainer(dto: TrainerSignupDto) {
    const email = dto.email.toLowerCase();
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User is already registered.');
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        name: `${dto.firstName} ${dto.lastName}`,
      },
    });

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        passwordHash: await this.passwordService.hash(dto.password),
        firstName: dto.firstName,
        lastName: dto.lastName,
        email,
        role: UserRole.TRAINER,
        status: UserStatus.PENDING_APPROVAL,
      },
    });

    return toPublicUser(user);
  }
}
