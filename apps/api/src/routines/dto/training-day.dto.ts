import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { RoutineExerciseDto } from './routine-exercise.dto';

export class TrainingDayDto {
  @ApiProperty({ example: 'Dia 1 - Pecho + Triceps' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order!: number;

  @ApiProperty({ type: [RoutineExerciseDto] })
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  exercises!: RoutineExerciseDto[];
}
