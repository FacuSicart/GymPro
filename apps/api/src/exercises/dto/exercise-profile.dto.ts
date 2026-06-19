import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseGoal, ExerciseLevel } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export const exerciseEquipmentTypes = [
  'libre',
  'maquina',
  'polea',
  'peso corporal',
  'banda',
  'otro',
] as const;

export class ExerciseProfileDto {
  @ApiProperty({ example: 'Sentadilla goblet' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example:
      'Ejercicio de tren inferior sosteniendo una carga frente al pecho.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1200)
  description!: string;

  @ApiProperty({ example: 'Piernas' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  primaryMuscleGroup!: string;

  @ApiPropertyOptional({ example: ['Gluteos', 'Core'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  secondaryMuscleGroups?: string[];

  @ApiProperty({ example: 'Sentadilla' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  movementPattern!: string;

  @ApiProperty({ enum: ExerciseLevel, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ExerciseLevel, { each: true })
  levels!: ExerciseLevel[];

  @ApiProperty({ example: 'Mancuerna o kettlebell' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  equipmentNeeded!: string;

  @ApiPropertyOptional({
    enum: exerciseEquipmentTypes,
    example: 'libre',
  })
  @IsOptional()
  @IsIn(exerciseEquipmentTypes)
  @MaxLength(40)
  equipmentType?: string;

  @ApiProperty({ enum: ExerciseGoal, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ExerciseGoal, { each: true })
  goals!: ExerciseGoal[];

  @ApiProperty({ example: 'Mantener el torso estable y controlar la bajada.' })
  @IsString()
  @MinLength(1)
  @MaxLength(1600)
  technicalInstructions!: string;

  @ApiPropertyOptional({
    example: 'Perder postura del torso o colapsar rodillas.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  commonMistakes?: string;

  @ApiPropertyOptional({
    example: 'Adaptar rango si hay molestias reportadas en rodilla.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  contraindications?: string;

  @ApiPropertyOptional({ example: 'https://example.com/video' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  imageUrl?: string;
}
