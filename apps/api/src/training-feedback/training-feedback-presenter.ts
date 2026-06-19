import type { Prisma } from '@prisma/client';

export type TrainingFeedbackWithDetails = Prisma.TrainingFeedbackGetPayload<{
  include: {
    student: true;
    routine: true;
    trainingSessionDay: true;
  };
}>;

export function toPublicTrainingFeedback(feedback: TrainingFeedbackWithDetails) {
  return {
    id: feedback.id,
    tenantId: feedback.tenantId,
    studentId: feedback.studentId,
    trainerId: feedback.trainerId,
    routineId: feedback.routineId,
    routineVersionId: feedback.routineVersionId,
    trainingSessionId: feedback.trainingSessionId,
    trainingSessionDayId: feedback.trainingSessionDayId,
    publicRoutineLinkId: feedback.publicRoutineLinkId,
    difficultyScore: feedback.difficultyScore,
    energyScore: feedback.energyScore,
    completedWorkout: feedback.completedWorkout,
    incompleteReason: feedback.incompleteReason,
    hadDiscomfort: feedback.hadDiscomfort,
    discomfortArea: feedback.discomfortArea,
    discomfortIntensity: feedback.discomfortIntensity,
    discomfortDescription: feedback.discomfortDescription,
    generalComment: feedback.generalComment,
    submittedAt: feedback.submittedAt,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
    student: {
      id: feedback.student.id,
      firstName: feedback.student.firstName,
      lastName: feedback.student.lastName,
    },
    routine: {
      id: feedback.routine.id,
      name: feedback.routine.name,
    },
    day: {
      id: feedback.trainingSessionDay.id,
      name: feedback.trainingSessionDay.name,
      order: feedback.trainingSessionDay.order,
    },
  };
}

export function toPublicTrainingFeedbacks(feedbacks: TrainingFeedbackWithDetails[]) {
  return feedbacks.map(toPublicTrainingFeedback);
}

export function toPublicFeedbackConfirmation(feedback: {
  submittedAt: Date;
  dayName: string;
}) {
  return {
    pending: false,
    submittedAt: feedback.submittedAt,
    dayName: feedback.dayName,
  };
}
