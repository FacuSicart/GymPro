import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { TrainingFeedbackService } from './training-feedback.service';

@ApiTags('training-feedback')
@ApiBearerAuth()
@Controller('training-sessions')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class SessionTrainingFeedbackController {
  constructor(private readonly trainingFeedbackService: TrainingFeedbackService) {}

  @Get(':id/feedback')
  @ApiOkResponse({ description: 'Training feedback associated with a session (one per completed day).' })
  listBySession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingFeedbackService.listBySession(user, id);
  }
}
