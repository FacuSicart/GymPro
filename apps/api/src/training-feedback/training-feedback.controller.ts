import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { ListTrainingFeedbackQueryDto } from './dto/list-training-feedback-query.dto';
import { TrainingFeedbackService } from './training-feedback.service';

@ApiTags('training-feedback')
@ApiBearerAuth()
@Controller('training-feedback')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class TrainingFeedbackController {
  constructor(private readonly trainingFeedbackService: TrainingFeedbackService) {}

  @Get()
  @ApiOkResponse({ description: 'Training feedback visible to the current user.' })
  listFeedback(
    @CurrentUser() user: User,
    @Query() query: ListTrainingFeedbackQueryDto,
  ) {
    return this.trainingFeedbackService.listFeedback(user, query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Training feedback detail.' })
  getFeedback(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingFeedbackService.getFeedback(user, id);
  }
}
