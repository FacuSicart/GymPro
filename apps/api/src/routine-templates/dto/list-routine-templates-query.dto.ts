import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineTemplateStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListRoutineTemplatesQueryDto {
  @ApiPropertyOptional({ enum: RoutineTemplateStatus })
  @IsOptional()
  @IsEnum(RoutineTemplateStatus)
  status?: RoutineTemplateStatus;
}
