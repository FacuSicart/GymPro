import { PartialType } from '@nestjs/swagger';
import { ExerciseProfileDto } from './exercise-profile.dto';

export class UpdateExerciseDto extends PartialType(ExerciseProfileDto) {}
