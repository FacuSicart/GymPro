import type { Prisma } from '@prisma/client';

export type RoutineTemplateWithDetails = Prisma.RoutineTemplateGetPayload<{
  include: {
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
  };
}>;

export function toPublicRoutineTemplate(template: RoutineTemplateWithDetails) {
  return {
    id: template.id,
    trainerId: template.trainerId,
    tenantId: template.tenantId,
    name: template.name,
    description: template.description,
    goal: template.goal,
    daysPerWeek: template.daysPerWeek,
    status: template.status,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    trainer: {
      firstName: template.trainer.firstName,
      lastName: template.trainer.lastName,
    },
    days: template.days
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
            templateDayId: item.templateDayId,
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
              levels: item.exercise.levels,
              goals: item.exercise.goals,
              technicalInstructions: item.exercise.technicalInstructions,
              commonMistakes: item.exercise.commonMistakes,
              contraindications: item.exercise.contraindications,
              videoUrl: item.exercise.videoUrl,
              imageUrl: item.exercise.imageUrl,
            },
          })),
      })),
  };
}

export function toPublicRoutineTemplates(templates: RoutineTemplateWithDetails[]) {
  return templates.map(toPublicRoutineTemplate);
}
