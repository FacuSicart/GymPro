import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination-query.dto';

export class ListRoutinesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: RoutineStatus })
  @IsOptional()
  @IsEnum(RoutineStatus)
  status?: RoutineStatus;
}
