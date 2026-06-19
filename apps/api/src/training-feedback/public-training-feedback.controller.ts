import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateTrainingFeedbackDto } from './dto/create-training-feedback.dto';
import { TrainingFeedbackService } from './training-feedback.service';

@ApiTags('public-routines')
@Controller('public-routines')
export class PublicTrainingFeedbackController {
  constructor(private readonly trainingFeedbackService: TrainingFeedbackService) {}

  @Get(':token/training-session/feedback')
  @ApiOkResponse({ description: 'Whether there is feedback pending for the latest completed session.' })
  getFeedbackStatus(@Param('token') token: string) {
    return this.trainingFeedbackService.getPublicFeedbackStatus(token);
  }

  @Post(':token/training-session/feedback')
  @ApiCreatedResponse({ description: 'Feedback submitted by the student for the latest completed session.' })
  createFeedback(@Param('token') token: string, @Body() dto: CreateTrainingFeedbackDto) {
    return this.trainingFeedbackService.createPublicFeedback(token, dto);
  }
}
