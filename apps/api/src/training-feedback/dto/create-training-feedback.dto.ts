import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateTrainingFeedbackDto {
  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  @Max(10)
  difficultyScore!: number;

  @ApiProperty({ example: 6 })
  @IsInt()
  @Min(1)
  @Max(10)
  energyScore!: number;

  @ApiProperty()
  @IsBoolean()
  completedWorkout!: boolean;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.completedWorkout === false)
  @IsString()
  @MaxLength(600)
  incompleteReason?: string;

  @ApiProperty()
  @IsBoolean()
  hadDiscomfort!: boolean;

  @ApiPropertyOptional()
  @ValidateIf((dto) => dto.hadDiscomfort === true)
  @IsString()
  @MaxLength(120)
  discomfortArea?: string;

  @ApiPropertyOptional({ example: 4 })
  @ValidateIf((dto) => dto.hadDiscomfort === true)
  @IsInt()
  @Min(1)
  @Max(10)
  discomfortIntensity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(600)
  discomfortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(600)
  generalComment?: string;
}
