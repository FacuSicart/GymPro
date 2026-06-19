import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseGoal } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class StudentProfileDto {
  @ApiPropertyOptional({ enum: ExerciseGoal })
  @IsOptional()
  @IsEnum(ExerciseGoal)
  goal?: ExerciseGoal;

  @ApiPropertyOptional({ example: 'Intermedio' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  experience?: string;

  @ApiPropertyOptional({ example: 32 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  age?: number;

  @ApiPropertyOptional({ example: 78.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(300)
  weightKg?: number;

  @ApiPropertyOptional({ example: 178 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(80)
  @Max(260)
  heightCm?: number;

  @ApiPropertyOptional({ example: 'Antecedentes relevantes para adaptar cargas.' })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  previousPhysicalNotes?: string;

  @ApiPropertyOptional({ example: 'Evitar saltos de alto impacto.' })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  restrictions?: string;

  @ApiPropertyOptional({ example: 'Molestia leve recurrente al hacer sentadilla profunda.' })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  recurrentDiscomforts?: string;

  @ApiPropertyOptional({ example: 'Prefiere entrenar por la tarde.' })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  observations?: string;
}
