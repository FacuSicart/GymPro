import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateTrainingSessionExerciseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  actualSets?: number;

  @ApiPropertyOptional({ example: '10,10,9,8' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  actualRepetitions?: string;

  @ApiPropertyOptional({ example: '60kg' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  actualLoad?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3600)
  actualRestSeconds?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  actualRir?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  actualRpe?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(600)
  trainerNotes?: string;
}
