import { ApiPropertyOptional } from '@nestjs/swagger';
import { TrainingSessionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ListTrainingSessionsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  routineId?: string;

  @ApiPropertyOptional({ enum: TrainingSessionStatus })
  @IsOptional()
  @IsEnum(TrainingSessionStatus)
  status?: TrainingSessionStatus;
}
