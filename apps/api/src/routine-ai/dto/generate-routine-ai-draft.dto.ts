import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseGoal } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class GenerateRoutineAiDraftDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ example: 'Rutina generada con IA' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiProperty({ enum: ExerciseGoal })
  @IsEnum(ExerciseGoal)
  goal!: ExerciseGoal;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  endDate!: string;

  @ApiProperty({ minimum: 1, maximum: 7 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek!: number;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  exercisesPerDay!: number;
}
