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
          AI_MAX_CATALOG_ITEMS: 200,
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

  it('requests long routines in day batches to avoid oversized AI responses', async () => {
    const { service } = createService();
    const requestSpy = jest
      .spyOn(service as never, 'requestRoutineDraft')
      .mockImplementation(
        async (
          _apiKey: string,
          _model: string,
          context: { chunk: { dayOrderStart: number; dayOrderEnd: number } },
        ) =>
          aiDraft(
            context.chunk.dayOrderStart,
            context.chunk.dayOrderEnd,
            '55555555-5555-4555-8555-555555555555',
          ),
      );

    const result = await (
      service as unknown as {
        requestChunkedRoutineDraft: (
          apiKey: string,
          model: string,
          context: Record<string, unknown>,
          targetDayCount: number,
          allowedExerciseIds: string[],
        ) => Promise<{ days: Array<{ order: number }> }>;
      }
    ).requestChunkedRoutineDraft('key', 'model', { rules: {} }, 25, [
      '55555555-5555-4555-8555-555555555555',
    ]);

    expect(requestSpy).toHaveBeenCalledTimes(3);
    expect(result.days).toHaveLength(25);
  });

  it('rejects AI output that repeats an exercise across consecutive days', () => {
    const { service } = createService();
    const draft = {
      summary: 'Rutina de prueba',
      weeklyStructure: 'Full Body',
      muscleDistribution: ['Piernas'],
      catalogWarnings: [],
      days: [
        {
          name: 'Dia 1',
          order: 1,
          focus: 'Full Body',
          exercises: [
            aiExercise('55555555-5555-4555-8555-555555555555', 1),
            aiExercise('66666666-6666-4666-8666-666666666666', 2),
          ],
        },
        {
          name: 'Dia 2',
          order: 2,
          focus: 'Full Body',
          exercises: [
            aiExercise('55555555-5555-4555-8555-555555555555', 1),
            aiExercise('77777777-7777-4777-8777-777777777777', 2),
          ],
        },
      ],
    };

    expect(() =>
      (
        service as unknown as {
          validateAiDraft: (
            draft: typeof draft,
            input: {
              targetDayCount: number;
              exercisesPerDay: number;
              allowedExerciseIds: Set<string>;
            },
          ) => void;
        }
      ).validateAiDraft(draft, {
        targetDayCount: 2,
        exercisesPerDay: 2,
        allowedExerciseIds: new Set([
          '55555555-5555-4555-8555-555555555555',
          '66666666-6666-4666-8666-666666666666',
          '77777777-7777-4777-8777-777777777777',
        ]),
        exercisePrimaryMuscles: new Map([
          ['55555555-5555-4555-8555-555555555555', 'Piernas'],
          ['66666666-6666-4666-8666-666666666666', 'Pecho'],
          ['77777777-7777-4777-8777-777777777777', 'Espalda'],
        ]),
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects AI output that repeats a primary muscle across consecutive days', () => {
    const { service } = createService();
    const draft = {
      summary: 'Rutina de prueba',
      weeklyStructure: 'Full Body',
      muscleDistribution: ['Espalda'],
      catalogWarnings: [],
      days: [
        {
          name: 'Dia 1',
          order: 1,
          focus: 'Espalda',
          exercises: [
            aiExercise('55555555-5555-4555-8555-555555555555', 1),
            aiExercise('66666666-6666-4666-8666-666666666666', 2),
          ],
        },
        {
          name: 'Dia 2',
          order: 2,
          focus: 'Espalda',
          exercises: [
            aiExercise('77777777-7777-4777-8777-777777777777', 1),
            aiExercise('88888888-8888-4888-8888-888888888888', 2),
          ],
        },
      ],
    };

    expect(() =>
      (
        service as unknown as {
          validateAiDraft: (
            draft: typeof draft,
            input: {
              targetDayCount: number;
              exercisesPerDay: number;
              allowedExerciseIds: Set<string>;
              exercisePrimaryMuscles: Map<string, string>;
            },
          ) => void;
        }
      ).validateAiDraft(draft, {
        targetDayCount: 2,
        exercisesPerDay: 2,
        allowedExerciseIds: new Set([
          '55555555-5555-4555-8555-555555555555',
          '66666666-6666-4666-8666-666666666666',
          '77777777-7777-4777-8777-777777777777',
          '88888888-8888-4888-8888-888888888888',
        ]),
        exercisePrimaryMuscles: new Map([
          ['55555555-5555-4555-8555-555555555555', 'Espalda'],
          ['66666666-6666-4666-8666-666666666666', 'Biceps'],
          ['77777777-7777-4777-8777-777777777777', 'Espalda'],
          ['88888888-8888-4888-8888-888888888888', 'Hombros'],
        ]),
      }),
    ).toThrow(BadRequestException);
  });

  it('replaces repeated exercises across consecutive days when catalog allows it', () => {
    const { service } = createService();
    const draft = {
      summary: 'Rutina de prueba',
      weeklyStructure: 'Full Body',
      muscleDistribution: ['Piernas'],
      catalogWarnings: [],
      days: [
        {
          name: 'Dia 1',
          order: 1,
          focus: 'Full Body',
          exercises: [
            aiExercise('55555555-5555-4555-8555-555555555555', 1),
            aiExercise('66666666-6666-4666-8666-666666666666', 2),
          ],
        },
        {
          name: 'Dia 2',
          order: 2,
          focus: 'Full Body',
          exercises: [
            aiExercise('55555555-5555-4555-8555-555555555555', 1),
            aiExercise('77777777-7777-4777-8777-777777777777', 2),
          ],
        },
      ],
    };

    const result = (
      service as unknown as {
        replaceInvalidExerciseRepeats: (
          draft: typeof draft,
          catalog: ReturnType<typeof catalogExercise>[],
        ) => typeof draft;
      }
    ).replaceInvalidExerciseRepeats(draft, [
      catalogExercise('55555555-5555-4555-8555-555555555555', 'Sentadilla', 'Piernas'),
      catalogExercise('66666666-6666-4666-8666-666666666666', 'Press banca', 'Pecho'),
      catalogExercise('77777777-7777-4777-8777-777777777777', 'Remo', 'Espalda'),
      catalogExercise('88888888-8888-4888-8888-888888888888', 'Peso muerto', 'Gluteos'),
    ]);

    const firstDayIds = new Set(
      result.days[0].exercises.map((exercise) => exercise.exerciseId),
    );
    expect(firstDayIds.has(result.days[1].exercises[0].exerciseId)).toBe(false);
    expect(result.days[1].exercises[0].exerciseId).toBe(
      '77777777-7777-4777-8777-777777777777',
    );
    expect(result.days[1].exercises[0].observations).toContain(
      'Reemplazo automatico por repeticion de ejercicio',
    );
  });

  it('replaces repeated primary muscles across consecutive days when catalog allows it', () => {
    const { service } = createService();
    const draft = {
      summary: 'Rutina de prueba',
      weeklyStructure: 'Full Body',
      muscleDistribution: ['Espalda'],
      catalogWarnings: [],
      days: [
        {
          name: 'Dia 1',
          order: 1,
          focus: 'Espalda',
          exercises: [
            aiExercise('55555555-5555-4555-8555-555555555555', 1),
            aiExercise('66666666-6666-4666-8666-666666666666', 2),
          ],
        },
        {
          name: 'Dia 2',
          order: 2,
          focus: 'Espalda',
          exercises: [
            aiExercise('77777777-7777-4777-8777-777777777777', 1),
            aiExercise('88888888-8888-4888-8888-888888888888', 2),
          ],
        },
      ],
    };

    const result = (
      service as unknown as {
        replaceInvalidExerciseRepeats: (
          draft: typeof draft,
          catalog: ReturnType<typeof catalogExercise>[],
        ) => typeof draft;
      }
    ).replaceInvalidExerciseRepeats(draft, [
      catalogExercise('55555555-5555-4555-8555-555555555555', 'Remo', 'Espalda'),
      catalogExercise('66666666-6666-4666-8666-666666666666', 'Curl', 'Biceps'),
      catalogExercise('77777777-7777-4777-8777-777777777777', 'Jalon', 'Espalda'),
      catalogExercise('88888888-8888-4888-8888-888888888888', 'Press militar', 'Hombros'),
      catalogExercise('99999999-9999-4999-8999-999999999999', 'Sentadilla', 'Piernas'),
    ]);

    expect(result.days[1].exercises[0].exerciseId).toBe(
      '88888888-8888-4888-8888-888888888888',
    );
    expect(result.days[1].exercises[0].observations).toContain(
      'Reemplazo automatico por repeticion de ejercicio',
    );
  });
});

function catalogExercise(id: string, name: string, primaryMuscleGroup = 'Piernas') {
  return {
    id,
    name,
    description: `${name} descripcion`,
    primaryMuscleGroup,
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

function aiDraft(startDay: number, endDay: number, exerciseId: string) {
  return {
    summary: 'Rutina de prueba',
    weeklyStructure: 'Full Body',
    muscleDistribution: ['Piernas'],
    catalogWarnings: [],
    days: Array.from({ length: endDay - startDay + 1 }, (_, index) => ({
      name: `Dia ${startDay + index}`,
      order: startDay + index,
      focus: 'Full Body',
      exercises: [aiExercise(exerciseId, 1)],
    })),
  };
}
