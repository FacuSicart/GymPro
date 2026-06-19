import type { Exercise } from '@prisma/client';

export function toPublicExercise(exercise: Exercise) {
  return exercise;
}

export function toPublicExercises(exercises: Exercise[]) {
  return exercises.map(toPublicExercise);
}
