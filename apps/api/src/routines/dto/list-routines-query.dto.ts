import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ListRoutinesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: RoutineStatus })
  @IsOptional()
  @IsEnum(RoutineStatus)
  status?: RoutineStatus;
}
