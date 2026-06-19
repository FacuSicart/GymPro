import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOkResponse({ description: 'Role-aware dashboard metrics.' })
  getMetrics(@CurrentUser() user: User) {
    return this.dashboardService.getMetrics(user);
  }
}
