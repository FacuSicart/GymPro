import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineTemplateStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination-query.dto';

export class ListRoutineTemplatesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RoutineTemplateStatus })
  @IsOptional()
  @IsEnum(RoutineTemplateStatus)
  status?: RoutineTemplateStatus;
}
