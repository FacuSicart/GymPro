import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { TrainingSessionsService } from './training-sessions.service';

@ApiTags('training-sessions')
@ApiBearerAuth()
@Controller('students')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class StudentTrainingSessionsController {
  constructor(private readonly trainingSessionsService: TrainingSessionsService) {}

  @Get(':id/training-sessions')
  @ApiOkResponse({ description: 'Training sessions for a given student.' })
  listByStudent(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingSessionsService.listByStudent(user, id);
  }
}
