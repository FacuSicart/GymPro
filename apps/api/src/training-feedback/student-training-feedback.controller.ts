import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { TrainingFeedbackService } from './training-feedback.service';

@ApiTags('training-feedback')
@ApiBearerAuth()
@Controller('students')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class StudentTrainingFeedbackController {
  constructor(private readonly trainingFeedbackService: TrainingFeedbackService) {}

  @Get(':id/training-feedback')
  @ApiOkResponse({ description: 'Training feedback for a given student.' })
  listByStudent(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingFeedbackService.listByStudent(user, id);
  }

  @Get(':id/discomfort-alerts')
  @ApiOkResponse({ description: 'Recurrent discomfort alerts for a given student.' })
  listRecurrentDiscomforts(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingFeedbackService.listRecurrentDiscomforts(user, id);
  }
}
