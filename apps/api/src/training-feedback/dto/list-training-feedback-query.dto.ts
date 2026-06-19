import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ListTrainingFeedbackQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  trainingSessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  routineId?: string;
}
