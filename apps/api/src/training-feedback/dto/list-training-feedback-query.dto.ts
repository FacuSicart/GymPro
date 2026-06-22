import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination-query.dto';

export class ListTrainingFeedbackQueryDto extends PaginationQueryDto {
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
