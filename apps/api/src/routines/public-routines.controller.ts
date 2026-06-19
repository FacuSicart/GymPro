import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';

@ApiTags('public-routines')
@Controller('public-routines')
export class PublicRoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get(':token')
  @ApiOkResponse({ description: 'Public routine snapshot by token.' })
  getPublicRoutine(@Param('token') token: string) {
    return this.routinesService.getPublicRoutineByToken(token);
  }
}
