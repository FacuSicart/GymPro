import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CreateRoutineDto } from './dto/create-routine.dto';
import { ListRoutinesQueryDto } from './dto/list-routines-query.dto';
import { SendPublicLinkEmailDto } from './dto/send-public-link-email.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutinesService } from './routines.service';

@ApiTags('routines')
@ApiBearerAuth()
@Controller('routines')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get()
  @ApiOkResponse({ description: 'Routines visible to the current user.' })
  listRoutines(
    @CurrentUser() user: User,
    @Query() query: ListRoutinesQueryDto,
  ) {
    return this.routinesService.listRoutines(user, query);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Routine created as draft.' })
  createRoutine(@CurrentUser() user: User, @Body() dto: CreateRoutineDto) {
    return this.routinesService.createRoutine(user, dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Routine detail.' })
  getRoutine(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.getRoutine(user, id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Routine updated.' })
  updateRoutine(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoutineDto,
  ) {
    return this.routinesService.updateRoutine(user, id, dto);
  }

  @Post(':id/duplicate')
  @ApiCreatedResponse({ description: 'Routine duplicated as draft.' })
  duplicateRoutine(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.duplicateRoutine(user, id);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Draft routine deleted.' })
  deleteRoutine(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.deleteRoutine(user, id);
  }

  @Patch(':id/publish')
  @ApiOkResponse({ description: 'Routine published and versioned.' })
  publishRoutine(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.publishRoutine(user, id);
  }

  @Patch(':id/archive')
  @ApiOkResponse({ description: 'Routine archived.' })
  archiveRoutine(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.archiveRoutine(user, id);
  }

  @Get(':id/versions')
  @ApiOkResponse({ description: 'Routine version history.' })
  listVersions(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.listVersions(user, id);
  }

  @Get(':id/public-link')
  @ApiOkResponse({ description: 'Current public link for this routine.' })
  getPublicLink(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.getPublicLink(user, id);
  }

  @Post(':id/public-link')
  @ApiCreatedResponse({ description: 'Public link generated for an active routine.' })
  generatePublicLink(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.generatePublicLink(user, id);
  }

  @Post(':id/public-link/email')
  @ApiOkResponse({ description: 'Public routine link sent by email.' })
  sendPublicLinkEmail(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendPublicLinkEmailDto,
  ) {
    return this.routinesService.sendPublicLinkEmail(user, id, dto.email);
  }

  @Patch(':id/public-link/revoke')
  @ApiOkResponse({ description: 'Public link revoked.' })
  revokePublicLink(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routinesService.revokePublicLink(user, id);
  }
}
