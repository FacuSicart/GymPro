import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ExerciseApprovalStatus,
  ExerciseGoal,
  ExerciseLevel,
  ExerciseOperationalStatus,
} from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListExercisesQueryDto {
  @ApiPropertyOptional({ enum: ExerciseApprovalStatus })
  @IsOptional()
  @IsEnum(ExerciseApprovalStatus)
  approvalStatus?: ExerciseApprovalStatus;

  @ApiPropertyOptional({ enum: ExerciseOperationalStatus })
  @IsOptional()
  @IsEnum(ExerciseOperationalStatus)
  operationalStatus?: ExerciseOperationalStatus;

  @ApiPropertyOptional({ example: 'Piernas' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  primaryMuscleGroup?: string;

  @ApiPropertyOptional({ enum: ExerciseGoal })
  @IsOptional()
  @IsEnum(ExerciseGoal)
  goal?: ExerciseGoal;

  @ApiPropertyOptional({ enum: ExerciseLevel })
  @IsOptional()
  @IsEnum(ExerciseLevel)
  level?: ExerciseLevel;

  @ApiPropertyOptional({ example: 'Mancuerna' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  equipmentNeeded?: string;

  @ApiPropertyOptional({ example: 'Empuje' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  movementPattern?: string;

  @ApiPropertyOptional({ example: 'sentadilla' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
