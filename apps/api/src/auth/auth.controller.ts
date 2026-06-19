import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user';
import { LoginDto } from './dto/login.dto';
import { TrainerSignupDto } from './dto/trainer-signup.dto';
import { ActiveUserGuard } from './active-user.guard';
import { LocalJwtAuthGuard } from './local-jwt-auth.guard';
import { toPublicUser } from '../users/user-presenter';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ description: 'Local database login.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(LocalJwtAuthGuard)
  @ApiOkResponse({
    description: 'Current local user.',
  })
  me(@CurrentUser() user: User) {
    return this.authService.getProfile({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
  }

  @Post('trainer-signup')
  @ApiCreatedResponse({
    description: 'Trainer registered as pending approval.',
  })
  trainerSignup(@Body() dto: TrainerSignupDto) {
    return this.authService.registerTrainer(dto);
  }

  @Get('session')
  @UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
  @ApiOkResponse({ description: 'Active internal session.' })
  session(@CurrentUser() user: User) {
    return { user: toPublicUser(user) };
  }
}
