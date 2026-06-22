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
import { AssignRoutineTemplateDto } from './dto/assign-routine-template.dto';
import { CreateRoutineTemplateDto } from './dto/create-routine-template.dto';
import { ListRoutineTemplatesQueryDto } from './dto/list-routine-templates-query.dto';
import { UpdateRoutineTemplateDto } from './dto/update-routine-template.dto';
import { RoutineTemplatesService } from './routine-templates.service';

@ApiTags('routine-templates')
@ApiBearerAuth()
@Controller('routine-templates')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class RoutineTemplatesController {
  constructor(private readonly routineTemplatesService: RoutineTemplatesService) {}

  @Get()
  @ApiOkResponse({ description: 'Routine templates visible to the current user.' })
  listTemplates(
    @CurrentUser() user: User,
    @Query() query: ListRoutineTemplatesQueryDto,
  ) {
    return this.routineTemplatesService.listTemplates(user, query);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Routine template created.' })
  createTemplate(@CurrentUser() user: User, @Body() dto: CreateRoutineTemplateDto) {
    return this.routineTemplatesService.createTemplate(user, dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Routine template detail.' })
  getTemplate(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routineTemplatesService.getTemplate(user, id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Routine template updated.' })
  updateTemplate(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoutineTemplateDto,
  ) {
    return this.routineTemplatesService.updateTemplate(user, id, dto);
  }

  @Patch(':id/archive')
  @ApiOkResponse({ description: 'Routine template archived.' })
  archiveTemplate(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routineTemplatesService.archiveTemplate(user, id);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Routine template deleted.' })
  deleteTemplate(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.routineTemplatesService.deleteTemplate(user, id);
  }

  @Post(':id/assign')
  @ApiCreatedResponse({ description: 'Routine template assigned to students.' })
  assignTemplate(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoutineTemplateDto,
  ) {
    return this.routineTemplatesService.assignTemplate(user, id, dto);
  }
}
