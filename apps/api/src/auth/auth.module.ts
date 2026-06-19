import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../database/prisma.module';
import { ActiveUserGuard } from './active-user.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalJwtAuthGuard } from './local-jwt-auth.guard';
import { PasswordService } from './password.service';
import { RolesGuard } from './roles.guard';
import { TokenService } from './token.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    LocalJwtAuthGuard,
    ActiveUserGuard,
    RolesGuard,
  ],
  exports: [
    PassportModule,
    TokenService,
    LocalJwtAuthGuard,
    ActiveUserGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
