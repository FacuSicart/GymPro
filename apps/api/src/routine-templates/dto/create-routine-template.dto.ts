import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseGoal } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { TrainingDayDto } from '../../routines/dto/training-day.dto';

export class CreateRoutineTemplateDto {
  @ApiProperty({ example: 'Fuerza inicial 3 dias' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(800)
  description?: string;

  @ApiPropertyOptional({ enum: ExerciseGoal })
  @IsOptional()
  @IsEnum(ExerciseGoal)
  goal?: ExerciseGoal;

  @ApiPropertyOptional({ minimum: 1, maximum: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;

  @ApiPropertyOptional({ type: [TrainingDayDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => TrainingDayDto)
  days?: TrainingDayDto[];
}
