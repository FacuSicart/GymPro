import type { Prisma, RoutineVersion } from '@prisma/client';

export type RoutineWithDetails = Prisma.RoutineGetPayload<{
  include: {
    student: true;
    trainer: true;
    days: {
      include: {
        exercises: {
          include: {
            exercise: true;
          };
        };
      };
    };
    versions: true;
  };
}>;

export function toPublicRoutine(routine: RoutineWithDetails) {
  return {
    id: routine.id,
    studentId: routine.studentId,
    trainerId: routine.trainerId,
    tenantId: routine.tenantId,
    name: routine.name,
    description: routine.description,
    goal: routine.goal,
    daysPerWeek: routine.daysPerWeek,
    status: routine.status,
    startDate: routine.startDate,
    endDate: routine.endDate,
    version: routine.version,
    publishedAt: routine.publishedAt,
    archivedAt: routine.archivedAt,
    createdAt: routine.createdAt,
    updatedAt: routine.updatedAt,
    student: {
      id: routine.student.id,
      firstName: routine.student.firstName,
      lastName: routine.student.lastName,
      email: routine.student.email,
      phone: routine.student.phone,
    },
    trainer: {
      firstName: routine.trainer.firstName,
      lastName: routine.trainer.lastName,
    },
    days: routine.days
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((day) => ({
        id: day.id,
        name: day.name,
        order: day.order,
        exercises: day.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            id: item.id,
            trainingDayId: item.trainingDayId,
            exerciseId: item.exerciseId,
            order: item.order,
            sets: item.sets,
            repetitions: item.repetitions,
            restSeconds: item.restSeconds,
            intensity: item.intensity,
            tempo: item.tempo,
            rir: item.rir,
            rpe: item.rpe,
            observations: item.observations,
            exercise: {
              id: item.exercise.id,
              name: item.exercise.name,
              description: item.exercise.description,
              primaryMuscleGroup: item.exercise.primaryMuscleGroup,
              movementPattern: item.exercise.movementPattern,
              equipmentNeeded: item.exercise.equipmentNeeded,
              equipmentType: item.exercise.equipmentType,
              goals: item.exercise.goals,
              technicalInstructions: item.exercise.technicalInstructions,
              commonMistakes: item.exercise.commonMistakes,
              contraindications: item.exercise.contraindications,
              videoUrl: item.exercise.videoUrl,
              imageUrl: item.exercise.imageUrl,
            },
          })),
      })),
    versions: routine.versions
      .slice()
      .sort((a, b) => b.version - a.version)
      .map(toPublicRoutineVersion),
  };
}

export function toPublicRoutines(routines: RoutineWithDetails[]) {
  return routines.map(toPublicRoutine);
}

export function toPublicRoutineVersion(version: RoutineVersion) {
  return {
    id: version.id,
    routineId: version.routineId,
    version: version.version,
    snapshot: version.snapshot,
    createdByUserId: version.createdByUserId,
    createdAt: version.createdAt,
  };
}

export function toPublicRoutineVersions(versions: RoutineVersion[]) {
  return versions.map(toPublicRoutineVersion);
}
