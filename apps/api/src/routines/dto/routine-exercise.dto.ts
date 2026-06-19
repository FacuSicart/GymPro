import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RoutineExerciseDto {
  @ApiProperty()
  @IsUUID()
  exerciseId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order!: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  sets?: number;

  @ApiPropertyOptional({ example: '8-12' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  repetitions?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3600)
  restSeconds?: number;

  @ApiPropertyOptional({ example: 'RIR 1-2' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  intensity?: string;

  @ApiPropertyOptional({ example: '3-1-1' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tempo?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  rir?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rpe?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(600)
  observations?: string;
}
