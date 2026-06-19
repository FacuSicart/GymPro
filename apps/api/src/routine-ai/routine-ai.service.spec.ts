import { BadRequestException } from '@nestjs/common';
import { ExerciseGoal, UserRole, UserStatus } from '@prisma/client';
import { RoutineAiService } from './routine-ai.service';

describe('RoutineAiService', () => {
  const user = {
    id: '11111111-1111-4111-8111-111111111111',
    tenantId: '22222222-2222-4222-8222-222222222222',
    role: UserRole.TRAINER,
    status: UserStatus.ACTIVE,
  } as never;

  const dto = {
    studentId: '33333333-3333-4333-8333-333333333333',
    goal: ExerciseGoal.HYPERTROPHY,
    startDate: '2026-06-01',
    endDate: '2026-06-07',
    daysPerWeek: 1,
    exercisesPerDay: 2,
  };

  function createService() {
    const prisma = {
      student: {
        findFirst: jest.fn().mockResolvedValue({
          id: dto.studentId,
          tenantId: '22222222-2222-4222-8222-222222222222',
          firstName: 'Ana',
          lastName: 'Perez',
          profile: null,
        }),
      },
      exercise: {
        findMany: jest.fn(),
      },
      studentHistoryEvent: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      trainingFeedback: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      routine: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      aiLog: {
        create: jest.fn().mockResolvedValue({
          id: '44444444-4444-4444-8444-444444444444',
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(),
    };
    const config = {
      get: jest.fn((key: string) => {
        const values: Record<string, unknown> = {
          OPENAI_API_KEY: 'test-key',
          AI_MODEL_ROUTINE_GENERATION: 'test-model',
          AI_MAX_CATALOG_ITEMS: 80,
          AI_REQUEST_TIMEOUT_MS: 30000,
        };
        return values[key];
      }),
    };

    return {
      prisma,
      service: new RoutineAiService(prisma as never, config as never),
    };
  }

  it('stops before requesting AI when approved active catalog is insufficient', async () => {
    const { prisma, service } = createService();
    prisma.exercise.findMany.mockResolvedValue([
      {
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Sentadilla',
        goals: [ExerciseGoal.HYPERTROPHY],
      },
    ]);
    const requestSpy = jest.spyOn(service as never, 'requestRoutineDraft');

    await expect(service.generateDraft(user, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(requestSpy).not.toHaveBeenCalled();
    expect(prisma.aiLog.create).not.toHaveBeenCalled();
  });

  it('rejects AI output that references an exercise outside the provided catalog', async () => {
    const { prisma, service } = createService();
    prisma.exercise.findMany.mockResolvedValue([
      catalogExercise('55555555-5555-4555-8555-555555555555', 'Sentadilla'),
      catalogExercise('66666666-6666-4666-8666-666666666666', 'Press banca'),
    ]);
    jest.spyOn(service as never, 'requestRoutineDraft').mockResolvedValue({
      summary: 'Rutina de prueba',
      weeklyStructure: 'Full Body',
      muscleDistribution: ['Piernas', 'Empuje'],
      catalogWarnings: [],
      days: [
        {
          name: 'Dia 1',
          order: 1,
          focus: 'Full Body',
          exercises: [
            aiExercise('55555555-5555-4555-8555-555555555555', 1),
            aiExercise('77777777-7777-4777-8777-777777777777', 2),
          ],
        },
      ],
    });

    await expect(service.generateDraft(user, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.aiLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'REJECTED_RULES',
        }),
      }),
    );
  });
});

function catalogExercise(id: string, name: string) {
  return {
    id,
    name,
    description: `${name} descripcion`,
    primaryMuscleGroup: 'Piernas',
    secondaryMuscleGroups: [],
    movementPattern: 'Sentadilla',
    levels: ['BEGINNER'],
    equipmentNeeded: 'Barra',
    equipmentType: 'barra',
    goals: [ExerciseGoal.HYPERTROPHY],
    technicalInstructions: 'Tecnica controlada',
    commonMistakes: null,
    contraindications: null,
  };
}

function aiExercise(exerciseId: string, order: number) {
  return {
    exerciseId,
    order,
    sets: 3,
    repetitions: '8-12',
    restSeconds: 90,
    intensity: 'Moderada',
    tempo: '3-1-1',
    rir: 2,
    rpe: 8,
    observations: 'Ejecutar con control.',
  };
}
