import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
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
import { RateLimit } from '../security/rate-limit.decorator';
import type { Response } from 'express';

const accessTokenCookieName = 'pg_access_token';
const accessTokenCookieMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @RateLimit({ limit: 10, windowMs: 60_000 })
  @ApiOkResponse({ description: 'Local database login.' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    this.setAccessTokenCookie(response, result.accessToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
      canAccessInternalApp: result.canAccessInternalApp,
    };
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
  @RateLimit({ limit: 5, windowMs: 60_000 })
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

  @Post('logout')
  @ApiOkResponse({ description: 'Local session cleared.' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(accessTokenCookieName, this.cookieOptions());
    return { loggedOut: true };
  }

  private setAccessTokenCookie(response: Response, token: string) {
    response.cookie(accessTokenCookieName, token, {
      ...this.cookieOptions(),
      maxAge: accessTokenCookieMaxAgeMs,
    });
  }

  private cookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }
}
