import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectExerciseDto {
  @ApiPropertyOptional({ example: 'Falta informacion tecnica suficiente.' })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  reason?: string;
}
