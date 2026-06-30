import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExerciseOperationalStatus } from '@prisma/client';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ListExercisesQueryDto } from './dto/list-exercises-query.dto';
import { RejectExerciseDto } from './dto/reject-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@ApiTags('exercises')
@ApiBearerAuth()
@Controller('exercises')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOkResponse({ description: 'Role-aware exercise catalog.' })
  listExercises(
    @CurrentUser() user: User,
    @Query() query: ListExercisesQueryDto,
  ) {
    return this.exercisesService.listExercises(user, query);
  }

  @Get('my-proposals')
  @ApiOkResponse({
    description: 'Exercise proposals created by the current user.',
  })
  listMyProposals(@CurrentUser() user: User) {
    return this.exercisesService.listMyProposals(user);
  }

  @Get('coverage')
  @ApiOkResponse({
    description: 'Coverage report for approved and active exercises.',
  })
  getCoverage(@CurrentUser() user: User) {
    return this.exercisesService.getCoverage(user);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Exercise created or proposed.' })
  createExercise(@CurrentUser() user: User, @Body() dto: CreateExerciseDto) {
    return this.exercisesService.createExercise(user, dto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({ description: 'Admin bulk import from an Excel file.' })
  importExercises(
    @CurrentUser() user: User,
    @UploadedFile()
    file?: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ) {
    return this.exercisesService.importExercisesFromExcel(user, file);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Exercise detail.' })
  getExercise(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exercisesService.getExercise(user, id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Exercise updated by admin.' })
  updateExercise(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.exercisesService.updateExercise(user, id, dto);
  }

  @Patch(':id/approve')
  @ApiOkResponse({ description: 'Exercise approved and activated by admin.' })
  approveExercise(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exercisesService.approveExercise(user, id);
  }

  @Patch(':id/reject')
  @ApiOkResponse({ description: 'Exercise rejected by admin.' })
  rejectExercise(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectExerciseDto,
  ) {
    return this.exercisesService.rejectExercise(user, id, dto.reason);
  }

  @Patch(':id/activate')
  @ApiOkResponse({ description: 'Exercise activated by admin.' })
  activateExercise(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exercisesService.setOperationalStatus(
      user,
      id,
      ExerciseOperationalStatus.ACTIVE,
    );
  }

  @Patch(':id/deactivate')
  @ApiOkResponse({ description: 'Exercise deactivated by admin.' })
  deactivateExercise(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exercisesService.setOperationalStatus(
      user,
      id,
      ExerciseOperationalStatus.INACTIVE,
    );
  }
}
