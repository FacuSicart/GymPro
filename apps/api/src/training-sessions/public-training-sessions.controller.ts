import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PublicTokenPipe } from '../security/public-token.pipe';
import { RateLimit } from '../security/rate-limit.decorator';
import { UpdateTrainingSessionExerciseDto } from './dto/update-training-session-exercise.dto';
import { TrainingSessionsService } from './training-sessions.service';

@ApiTags('public-routines')
@Controller('public-routines')
export class PublicTrainingSessionsController {
  constructor(private readonly trainingSessionsService: TrainingSessionsService) {}

  @Post(':token/training-session')
  @RateLimit({ limit: 20, windowMs: 60_000 })
  @ApiCreatedResponse({ description: 'Training session started (or resumed) from a public routine link.' })
  startSession(@Param('token', PublicTokenPipe) token: string) {
    return this.trainingSessionsService.startPublicSession(token);
  }

  @Get(':token/training-session')
  @RateLimit({ limit: 60, windowMs: 60_000 })
  @ApiOkResponse({ description: 'Current in-progress training session for this public routine link, if any.' })
  getSession(@Param('token', PublicTokenPipe) token: string) {
    return this.trainingSessionsService.getPublicSession(token);
  }

  @Patch(':token/training-session/days/:dayId/complete')
  @RateLimit({ limit: 30, windowMs: 60_000 })
  @ApiOkResponse({ description: 'Training day marked as completed by the student.' })
  completeDay(@Param('token', PublicTokenPipe) token: string, @Param('dayId', ParseUUIDPipe) dayId: string) {
    return this.trainingSessionsService.completePublicSessionDay(token, dayId);
  }

  @Patch(':token/training-session/exercises/:exerciseId')
  @RateLimit({ limit: 60, windowMs: 60_000 })
  @ApiOkResponse({ description: 'Training session exercise execution updated by the student.' })
  updateExercise(
    @Param('token', PublicTokenPipe) token: string,
    @Param('exerciseId', ParseUUIDPipe) exerciseId: string,
    @Body() dto: UpdateTrainingSessionExerciseDto,
  ) {
    return this.trainingSessionsService.updatePublicSessionExercise(token, exerciseId, dto);
  }
}
