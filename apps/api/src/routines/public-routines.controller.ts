import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PublicTokenPipe } from '../security/public-token.pipe';
import { RateLimit } from '../security/rate-limit.decorator';
import { RoutinesService } from './routines.service';

@ApiTags('public-routines')
@Controller('public-routines')
export class PublicRoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get(':token')
  @RateLimit({ limit: 60, windowMs: 60_000 })
  @ApiOkResponse({ description: 'Public routine snapshot by token.' })
  getPublicRoutine(@Param('token', PublicTokenPipe) token: string) {
    return this.routinesService.getPublicRoutineByToken(token);
  }
}
