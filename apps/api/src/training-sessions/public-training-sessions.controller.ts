import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateTrainingSessionExerciseDto } from './dto/update-training-session-exercise.dto';
import { TrainingSessionsService } from './training-sessions.service';

@ApiTags('public-routines')
@Controller('public-routines')
export class PublicTrainingSessionsController {
  constructor(private readonly trainingSessionsService: TrainingSessionsService) {}

  @Post(':token/training-session')
  @ApiCreatedResponse({ description: 'Training session started (or resumed) from a public routine link.' })
  startSession(@Param('token') token: string) {
    return this.trainingSessionsService.startPublicSession(token);
  }

  @Get(':token/training-session')
  @ApiOkResponse({ description: 'Current in-progress training session for this public routine link, if any.' })
  getSession(@Param('token') token: string) {
    return this.trainingSessionsService.getPublicSession(token);
  }

  @Patch(':token/training-session/days/:dayId/complete')
  @ApiOkResponse({ description: 'Training day marked as completed by the student.' })
  completeDay(@Param('token') token: string, @Param('dayId') dayId: string) {
    return this.trainingSessionsService.completePublicSessionDay(token, dayId);
  }

  @Patch(':token/training-session/exercises/:exerciseId')
  @ApiOkResponse({ description: 'Training session exercise execution updated by the student.' })
  updateExercise(
    @Param('token') token: string,
    @Param('exerciseId') exerciseId: string,
    @Body() dto: UpdateTrainingSessionExerciseDto,
  ) {
    return this.trainingSessionsService.updatePublicSessionExercise(token, exerciseId, dto);
  }
}
