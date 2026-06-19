import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { ListTrainingSessionsQueryDto } from './dto/list-training-sessions-query.dto';
import { UpdateTrainingSessionExerciseDto } from './dto/update-training-session-exercise.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { TrainingSessionsService } from './training-sessions.service';

@ApiTags('training-sessions')
@ApiBearerAuth()
@Controller('training-sessions')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class TrainingSessionsController {
  constructor(private readonly trainingSessionsService: TrainingSessionsService) {}

  @Get()
  @ApiOkResponse({ description: 'Training sessions visible to the current user.' })
  listSessions(
    @CurrentUser() user: User,
    @Query() query: ListTrainingSessionsQueryDto,
  ) {
    return this.trainingSessionsService.listSessions(user, query);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Training session created from an active routine.' })
  createSession(@CurrentUser() user: User, @Body() dto: CreateTrainingSessionDto) {
    return this.trainingSessionsService.createSession(user, dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Training session detail.' })
  getSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingSessionsService.getSession(user, id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Training session updated.' })
  updateSession(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateTrainingSessionDto,
  ) {
    return this.trainingSessionsService.updateSession(user, id, dto);
  }

  @Patch(':id/start')
  @ApiOkResponse({ description: 'Training session started.' })
  startSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingSessionsService.startSession(user, id);
  }

  @Patch(':id/complete')
  @ApiOkResponse({ description: 'Training session completed.' })
  completeSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingSessionsService.completeSession(user, id);
  }

  @Patch(':id/cancel')
  @ApiOkResponse({ description: 'Training session cancelled.' })
  cancelSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trainingSessionsService.cancelSession(user, id);
  }

  @Patch('exercises/:id')
  @ApiOkResponse({ description: 'Training session exercise execution updated.' })
  updateSessionExercise(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateTrainingSessionExerciseDto,
  ) {
    return this.trainingSessionsService.updateSessionExercise(user, id, dto);
  }
}
