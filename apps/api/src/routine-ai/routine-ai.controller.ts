import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/active-user.guard';
import { CurrentUser } from '../auth/current-user';
import { LocalJwtAuthGuard } from '../auth/local-jwt-auth.guard';
import { GenerateRoutineAiDraftDto } from './dto/generate-routine-ai-draft.dto';
import { RoutineAiService } from './routine-ai.service';

@ApiTags('routine-ai')
@ApiBearerAuth()
@Controller('routines/ai-draft')
@UseGuards(LocalJwtAuthGuard, ActiveUserGuard)
export class RoutineAiController {
  constructor(private readonly routineAiService: RoutineAiService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Routine generated as editable draft.' })
  generateDraft(
    @CurrentUser() user: User,
    @Body() dto: GenerateRoutineAiDraftDto,
  ) {
    return this.routineAiService.generateDraft(user, dto);
  }
}
