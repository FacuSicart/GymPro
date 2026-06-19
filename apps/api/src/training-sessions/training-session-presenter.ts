import type { Prisma } from '@prisma/client';

export type TrainingSessionWithDetails = Prisma.TrainingSessionGetPayload<{
  include: {
    student: true;
    trainer: true;
    routine: true;
    routineVersion: true;
    days: {
      include: {
        exercises: true;
      };
    };
  };
}>;

export function toPublicTrainingSession(session: TrainingSessionWithDetails) {
  return {
    id: session.id,
    tenantId: session.tenantId,
    studentId: session.studentId,
    trainerId: session.trainerId,
    routineId: session.routineId,
    routineVersionId: session.routineVersionId,
    status: session.status,
    scheduledDate: session.scheduledDate,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    cancelledAt: session.cancelledAt,
    notes: session.notes,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    student: {
      id: session.student.id,
      firstName: session.student.firstName,
      lastName: session.student.lastName,
    },
    trainer: {
      firstName: session.trainer.firstName,
      lastName: session.trainer.lastName,
    },
    routine: {
      id: session.routine.id,
      name: session.routine.name,
    },
    routineVersion: session.routineVersion.version,
    days: session.days
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((day) => ({
        id: day.id,
        name: day.name,
        order: day.order,
        completedAt: day.completedAt,
        exercises: day.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            id: item.id,
            trainingSessionDayId: item.trainingSessionDayId,
            order: item.order,
            exerciseName: item.exerciseName,
            exerciseVideoUrl: item.exerciseVideoUrl,
            exerciseImageUrl: item.exerciseImageUrl,
            exerciseSnapshot: item.routineExerciseSnapshot,
            plannedSets: item.plannedSets,
            plannedRepetitions: item.plannedRepetitions,
            plannedRestSeconds: item.plannedRestSeconds,
            plannedIntensity: item.plannedIntensity,
            plannedTempo: item.plannedTempo,
            plannedRir: item.plannedRir,
            plannedRpe: item.plannedRpe,
            completed: item.completed,
            actualSets: item.actualSets,
            actualRepetitions: item.actualRepetitions,
            actualLoad: item.actualLoad,
            actualRestSeconds: item.actualRestSeconds,
            actualRir: item.actualRir,
            actualRpe: item.actualRpe,
            trainerNotes: item.trainerNotes,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
      })),
  };
}

export function toPublicTrainingSessions(sessions: TrainingSessionWithDetails[]) {
  return sessions.map(toPublicTrainingSession);
}

export type TrainingSessionExerciseWithSession = Prisma.TrainingSessionExerciseGetPayload<{
  include: {
    trainingSessionDay: {
      include: {
        trainingSession: true;
      };
    };
  };
}>;

export function toPublicTrainingSessionExercise(
  item: TrainingSessionExerciseWithSession,
) {
  return {
    id: item.id,
    trainingSessionDayId: item.trainingSessionDayId,
    order: item.order,
    exerciseName: item.exerciseName,
    exerciseVideoUrl: item.exerciseVideoUrl,
    exerciseImageUrl: item.exerciseImageUrl,
    exerciseSnapshot: item.routineExerciseSnapshot,
    plannedSets: item.plannedSets,
    plannedRepetitions: item.plannedRepetitions,
    plannedRestSeconds: item.plannedRestSeconds,
    plannedIntensity: item.plannedIntensity,
    plannedTempo: item.plannedTempo,
    plannedRir: item.plannedRir,
    plannedRpe: item.plannedRpe,
    completed: item.completed,
    actualSets: item.actualSets,
    actualRepetitions: item.actualRepetitions,
    actualLoad: item.actualLoad,
    actualRestSeconds: item.actualRestSeconds,
    actualRir: item.actualRir,
    actualRpe: item.actualRpe,
    trainerNotes: item.trainerNotes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export type TrainingSessionForLink = Prisma.TrainingSessionGetPayload<{
  include: {
    days: {
      include: {
        exercises: true;
      };
    };
  };
}>;

export function toPublicLinkExercise(item: TrainingSessionForLink['days'][number]['exercises'][number]) {
  return {
    id: item.id,
    order: item.order,
    exerciseName: item.exerciseName,
    exerciseVideoUrl: item.exerciseVideoUrl,
    exerciseImageUrl: item.exerciseImageUrl,
    plannedSets: item.plannedSets,
    plannedRepetitions: item.plannedRepetitions,
    plannedRestSeconds: item.plannedRestSeconds,
    plannedIntensity: item.plannedIntensity,
    plannedTempo: item.plannedTempo,
    plannedRir: item.plannedRir,
    plannedRpe: item.plannedRpe,
    completed: item.completed,
    actualSets: item.actualSets,
    actualRepetitions: item.actualRepetitions,
    actualLoad: item.actualLoad,
    actualRestSeconds: item.actualRestSeconds,
    actualRir: item.actualRir,
    actualRpe: item.actualRpe,
    trainerNotes: item.trainerNotes,
  };
}

export function toPublicLinkTrainingSession(session: TrainingSessionForLink) {
  return {
    id: session.id,
    status: session.status,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    days: session.days
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((day) => ({
        id: day.id,
        name: day.name,
        order: day.order,
        completedAt: day.completedAt,
        exercises: day.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(toPublicLinkExercise),
      })),
  };
}

