import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiLogStatus,
  AiLogType,
  ExerciseApprovalStatus,
  ExerciseGoal,
  ExerciseOperationalStatus,
  Prisma,
  RoutineStatus,
  StudentHistoryEventType,
  User,
  UserRole,
} from '@prisma/client';
import { z } from 'zod';
import { Environment } from '../config/env.validation';
import { PrismaService } from '../database/prisma.service';
import { toPublicRoutine } from '../routines/routine-presenter';
import { GenerateRoutineAiDraftDto } from './dto/generate-routine-ai-draft.dto';

const PROMPT_VERSION = 'routine-ai-v1';
const STRATEGY_VERSION = 'catalog-only-exact-counts-chunked-v2';
const DEFAULT_MODEL = 'gpt-4.1-mini';
const ROUTINE_AI_DAY_BATCH_SIZE = 10;
const ROUTINE_AI_MAX_OUTPUT_TOKENS = 16_000;

const routineInclude = {
  student: true,
  trainer: true,
  days: {
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  },
  versions: true,
} satisfies Prisma.RoutineInclude;

const aiExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  order: z.number().int().min(1),
  sets: z.number().int().min(1).max(20),
  repetitions: z.string().min(1).max(40),
  restSeconds: z.number().int().min(0).max(3600),
  intensity: z.string().min(1).max(80),
  tempo: z.string().min(1).max(40),
  rir: z.number().int().min(0).max(10),
  rpe: z.number().int().min(1).max(10),
  observations: z.string().min(1).max(600),
});

const aiRoutineSchema = z.object({
  summary: z.string().min(1),
  weeklyStructure: z.string().min(1),
  muscleDistribution: z.array(z.string().min(1)).min(1).max(20),
  catalogWarnings: z.array(z.string().min(1)).max(10),
  days: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        order: z.number().int().min(1),
        focus: z.string().min(1).max(120),
        exercises: z.array(aiExerciseSchema).min(1).max(12),
      }),
    )
    .min(1)
    .max(60),
});

type AiRoutineDraft = z.infer<typeof aiRoutineSchema>;

@Injectable()
export class RoutineAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  async generateDraft(user: User, dto: GenerateRoutineAiDraftDto) {
    this.assertTrainer(user);
    this.validateDateRange(dto.startDate, dto.endDate);

    const targetDayCount = this.calculateTrainingDayTotal(
      dto.startDate,
      dto.endDate,
      dto.daysPerWeek,
    );
    const model = this.config.get('AI_MODEL_ROUTINE_GENERATION') ?? DEFAULT_MODEL;
    const apiKey = this.config.get('OPENAI_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI routine generation is not configured.',
      );
    }

    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.studentId,
        trainerId: user.id,
        tenantId: user.tenantId,
        status: 'ACTIVE',
      },
      include: { profile: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found.');
    }

    const catalog = await this.loadCatalog(dto.goal);
    const minimumCatalogItems =
      targetDayCount > 1 ? dto.exercisesPerDay * 2 : dto.exercisesPerDay;
    if (catalog.length < minimumCatalogItems) {
      throw new BadRequestException(
        'Catalog has insufficient approved active exercises.',
      );
    }

    const context = await this.buildContext({
      user,
      dto,
      targetDayCount,
      student,
      catalog,
    });

    let aiLogId: string | null = null;
    try {
      const aiLog = await this.prisma.aiLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          studentId: student.id,
          type: AiLogType.ROUTINE_GENERATION,
          status: AiLogStatus.ERROR,
          model,
          promptVersion: PROMPT_VERSION,
          strategyVersion: STRATEGY_VERSION,
          inputSummary: this.inputSummary(dto, targetDayCount, catalog.length),
        },
      });
      aiLogId = aiLog.id;

      const rawDraft = await this.requestChunkedRoutineDraft(
        apiKey,
        model,
        context,
        targetDayCount,
        catalog.map((exercise) => exercise.id),
      );

      const normalizedDraft = this.replaceInvalidExerciseRepeats(
        this.normalizeAiDraftOrders(rawDraft),
        catalog,
      );

      try {
        this.validateAiDraft(normalizedDraft, {
          targetDayCount,
          exercisesPerDay: dto.exercisesPerDay,
          allowedExerciseIds: new Set(catalog.map((exercise) => exercise.id)),
        });
      } catch (error) {
        await this.markAiLog(aiLog.id, AiLogStatus.REJECTED_RULES, {
          error: error instanceof Error ? error.message : 'AI rule validation failed.',
        });
        throw error;
      }

      const routine = await this.prisma.$transaction(async (tx) => {
        const created = await tx.routine.create({
          data: {
            studentId: student.id,
            trainerId: user.id,
            tenantId: user.tenantId,
            name:
              dto.name?.trim() ||
              `Rutina IA - ${student.firstName} ${student.lastName}`,
            description: this.buildRoutineDescription(normalizedDraft),
            goal: dto.goal,
            daysPerWeek: dto.daysPerWeek,
            status: RoutineStatus.DRAFT,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            days: {
              create: normalizedDraft.days.map((day) => ({
                name: day.name.trim(),
                order: day.order,
                exercises: {
                  create: day.exercises.map((item) => ({
                    exerciseId: item.exerciseId,
                    order: item.order,
                    sets: item.sets,
                    repetitions: item.repetitions.trim(),
                    restSeconds: item.restSeconds,
                    intensity: item.intensity.trim(),
                    tempo: item.tempo.trim(),
                    rir: item.rir,
                    rpe: item.rpe,
                    observations: item.observations.trim(),
                  })),
                },
              })),
            },
          },
          include: routineInclude,
        });

        await tx.studentHistoryEvent.create({
          data: {
            studentId: student.id,
            tenantId: user.tenantId,
            trainerId: user.id,
            createdByUserId: user.id,
            type: StudentHistoryEventType.ROUTINE_CREATED,
            summary: `Rutina generada con IA en borrador: ${created.name}.`,
            metadata: {
              source: 'routine-ai',
              routineId: created.id,
              aiLogId,
              model,
              promptVersion: PROMPT_VERSION,
              strategyVersion: STRATEGY_VERSION,
            },
          },
        });

        await tx.aiLog.update({
          where: { id: aiLog.id },
          data: {
            routineId: created.id,
            status: AiLogStatus.SUCCESS,
            outputSummary: this.outputSummary(normalizedDraft),
            error: null,
          },
        });

        return created;
      });

      return toPublicRoutine(routine);
    } catch (error) {
      if (aiLogId && !(error instanceof BadRequestException)) {
        await this.markAiLog(aiLogId, AiLogStatus.ERROR, {
          error: error instanceof Error ? error.message : 'Unknown AI error.',
        });
      }
      throw error;
    }
  }

  private async loadCatalog(goal: ExerciseGoal) {
    const maxItems = this.config.get('AI_MAX_CATALOG_ITEMS');
    const exercises = await this.prisma.exercise.findMany({
      where: {
        approvalStatus: ExerciseApprovalStatus.APPROVED,
        operationalStatus: ExerciseOperationalStatus.ACTIVE,
      },
      orderBy: [{ primaryMuscleGroup: 'asc' }, { name: 'asc' }],
      take: Math.max(maxItems, 1),
    });

    return exercises.sort((a, b) => {
      const aGoal = a.goals.includes(goal) ? 0 : 1;
      const bGoal = b.goals.includes(goal) ? 0 : 1;
      if (aGoal !== bGoal) return aGoal - bGoal;
      return a.name.localeCompare(b.name);
    });
  }

  private async buildContext(input: {
    user: User;
    dto: GenerateRoutineAiDraftDto;
    targetDayCount: number;
    student: Prisma.StudentGetPayload<{ include: { profile: true } }>;
    catalog: Awaited<ReturnType<RoutineAiService['loadCatalog']>>;
  }) {
    const [history, feedback, routines] = await Promise.all([
      this.prisma.studentHistoryEvent.findMany({
        where: { studentId: input.student.id },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      this.prisma.trainingFeedback.findMany({
        where: {
          studentId: input.student.id,
          trainerId: input.user.id,
          hadDiscomfort: true,
        },
        orderBy: { submittedAt: 'desc' },
        take: 12,
      }),
      this.prisma.routine.findMany({
        where: { studentId: input.student.id, trainerId: input.user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          days: {
            include: {
              exercises: {
                include: {
                  exercise: {
                    select: {
                      name: true,
                      primaryMuscleGroup: true,
                      movementPattern: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      rules: {
        exactDays: input.targetDayCount,
        exactExercisesPerDay: input.dto.exercisesPerDay,
        routineStatus: 'DRAFT',
        catalogPolicy:
          'Use exclusively exercise IDs present in allowedCatalog. Do not invent exercises.',
        exerciseVarietyPolicy:
          'Do not repeat the same exercise inside a day or across two consecutive training days.',
        medicalPolicy:
          'Do not diagnose, treat, prescribe rehabilitation, or give medical advice. Adapt selection conservatively.',
      },
      request: {
        goal: input.dto.goal,
        startDate: input.dto.startDate,
        endDate: input.dto.endDate,
        daysPerWeek: input.dto.daysPerWeek,
        exercisesPerDay: input.dto.exercisesPerDay,
      },
      student: {
        firstName: input.student.firstName,
        lastName: input.student.lastName,
        profile: input.student.profile,
      },
      recentHistory: history.map((event) => ({
        type: event.type,
        summary: event.summary,
        createdAt: event.createdAt,
      })),
      recurrentDiscomforts: feedback.map((item) => ({
        area: item.discomfortArea,
        intensity: item.discomfortIntensity,
        description: item.discomfortDescription,
        submittedAt: item.submittedAt,
      })),
      previousRoutines: routines.map((routine) => ({
        name: routine.name,
        goal: routine.goal,
        status: routine.status,
        days: routine.days.map((day) => ({
          name: day.name,
          exercises: day.exercises.map((item) => ({
            name: item.exercise.name,
            primaryMuscleGroup: item.exercise.primaryMuscleGroup,
            movementPattern: item.exercise.movementPattern,
          })),
        })),
      })),
      allowedCatalog: input.catalog.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        primaryMuscleGroup: exercise.primaryMuscleGroup,
        secondaryMuscleGroups: exercise.secondaryMuscleGroups,
        movementPattern: exercise.movementPattern,
        equipmentNeeded: exercise.equipmentNeeded,
        equipmentType: exercise.equipmentType,
        goals: exercise.goals,
        technicalInstructions: exercise.technicalInstructions,
        commonMistakes: exercise.commonMistakes,
        contraindications: exercise.contraindications,
      })),
    };
  }

  private async requestRoutineDraft(
    apiKey: string,
    model: string,
    context: unknown,
    allowedExerciseIds: string[],
  ) {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_output_tokens: ROUTINE_AI_MAX_OUTPUT_TOKENS,
        input: [
          { role: 'system', content: this.systemPrompt() },
          { role: 'user', content: JSON.stringify(context) },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'routine_ai_draft',
            strict: true,
            schema: this.responseJsonSchema(allowedExerciseIds),
          },
        },
      }),
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new ServiceUnavailableException(
        this.providerErrorMessage(response.status, rawText),
      );
    }

    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const outputText = this.extractOutputText(parsed);
    if (!outputText) {
      throw new BadRequestException(
        'AI response did not include structured routine output.',
      );
    }

    return JSON.parse(outputText) as unknown;
  }

  private async requestChunkedRoutineDraft(
    apiKey: string,
    model: string,
    context: Record<string, unknown>,
    targetDayCount: number,
    allowedExerciseIds: string[],
  ): Promise<AiRoutineDraft> {
    const chunks: AiRoutineDraft[] = [];

    for (
      let startDay = 1;
      startDay <= targetDayCount;
      startDay += ROUTINE_AI_DAY_BATCH_SIZE
    ) {
      const endDay = Math.min(
        startDay + ROUTINE_AI_DAY_BATCH_SIZE - 1,
        targetDayCount,
      );
      const chunkContext = this.buildChunkContext(context, startDay, endDay);
      const rawChunk = await this.requestRoutineDraft(
        apiKey,
        model,
        chunkContext,
        allowedExerciseIds,
      );
      const parsed = aiRoutineSchema.safeParse(rawChunk);

      if (!parsed.success) {
        throw new BadRequestException(
          'AI response did not match the expected routine structure.',
        );
      }

      chunks.push(parsed.data);
    }

    return {
      summary: chunks[0]?.summary ?? 'Rutina generada con IA.',
      weeklyStructure:
        chunks[0]?.weeklyStructure ??
        `Rutina de ${targetDayCount} dias de entrenamiento.`,
      muscleDistribution: this.uniqueStrings(
        chunks.flatMap((chunk) => chunk.muscleDistribution),
      ),
      catalogWarnings: this.uniqueStrings(
        chunks.flatMap((chunk) => chunk.catalogWarnings),
      ),
      days: chunks.flatMap((chunk) => chunk.days),
    };
  }

  private buildChunkContext(
    context: Record<string, unknown>,
    startDay: number,
    endDay: number,
  ) {
    const exactDays = endDay - startDay + 1;
    const rules = this.asRecord(context.rules);

    return {
      ...context,
      rules: {
        ...rules,
        exactDays,
        dayOrderStart: startDay,
        dayOrderEnd: endDay,
      },
      chunk: {
        dayOrderStart: startDay,
        dayOrderEnd: endDay,
        exactDays,
        instruction:
          'Generate only this day-order range. Do not generate days outside this range.',
      },
    };
  }

  private systemPrompt() {
    return [
      'Act as an experienced strength and conditioning coach.',
      'Use only the approved active exercise catalog provided by the system.',
      'For exerciseId, copy exactly one ID from allowedCatalog.id. Never write exercise names in exerciseId.',
      'Never invent exercises, IDs, names, URLs, diagnoses, treatments, or rehabilitation advice.',
      'Generate exactly the requested number of days and exactly the requested number of exercises per day.',
      'Do not repeat the same exercise inside one day or across two consecutive training days.',
      'Every exercise must include sets, repetitions, restSeconds, intensity, tempo, rir, rpe, and observations.',
      'Prioritize restrictions, recurrent discomfort, safety, goal, experience, weekly balance, and variety.',
      'Return JSON only, matching the schema.',
    ].join(' ');
  }

  private responseJsonSchema(allowedExerciseIds: string[]) {
    return {
      type: 'object',
      additionalProperties: false,
      required: [
        'summary',
        'weeklyStructure',
        'muscleDistribution',
        'catalogWarnings',
        'days',
      ],
      properties: {
        summary: { type: 'string' },
        weeklyStructure: { type: 'string' },
        muscleDistribution: {
          type: 'array',
          items: { type: 'string' },
        },
        catalogWarnings: {
          type: 'array',
          items: { type: 'string' },
        },
        days: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'order', 'focus', 'exercises'],
            properties: {
              name: { type: 'string' },
              order: { type: 'integer' },
              focus: { type: 'string' },
              exercises: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'exerciseId',
                    'order',
                    'sets',
                    'repetitions',
                    'restSeconds',
                    'intensity',
                    'tempo',
                    'rir',
                    'rpe',
                    'observations',
                  ],
                  properties: {
                    exerciseId: { type: 'string', enum: allowedExerciseIds },
                    order: { type: 'integer' },
                    sets: { type: 'integer' },
                    repetitions: { type: 'string' },
                    restSeconds: { type: 'integer' },
                    intensity: { type: 'string' },
                    tempo: { type: 'string' },
                    rir: { type: 'integer' },
                    rpe: { type: 'integer' },
                    observations: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  private validateAiDraft(
    draft: AiRoutineDraft,
    input: {
      targetDayCount: number;
      exercisesPerDay: number;
      allowedExerciseIds: Set<string>;
    },
  ) {
    if (draft.days.length !== input.targetDayCount) {
      throw new BadRequestException(
        'AI routine day count does not match the request.',
      );
    }

    this.assertUniqueOrders(
      draft.days.map((day) => day.order),
      'AI routine day order must be unique.',
    );

    let previousDayExerciseIds = new Set<string>();
    for (const day of draft.days) {
      if (day.exercises.length !== input.exercisesPerDay) {
        throw new BadRequestException(
          'AI routine exercise count does not match the request.',
        );
      }
      this.assertUniqueOrders(
        day.exercises.map((item) => item.order),
        'AI routine exercise order must be unique per day.',
      );

      const dayExerciseIds = new Set<string>();
      for (const item of day.exercises) {
        if (!input.allowedExerciseIds.has(item.exerciseId)) {
          throw new BadRequestException(
            'AI routine used an exercise outside the approved active catalog.',
          );
        }
        if (dayExerciseIds.has(item.exerciseId)) {
          throw new BadRequestException(
            'AI routine duplicated an exercise inside the same day.',
          );
        }
        dayExerciseIds.add(item.exerciseId);
      }
      for (const exerciseId of dayExerciseIds) {
        if (previousDayExerciseIds.has(exerciseId)) {
          throw new BadRequestException(
            'AI routine repeated an exercise across consecutive days.',
          );
        }
      }
      previousDayExerciseIds = dayExerciseIds;
    }
  }

  private normalizeAiDraftOrders(draft: AiRoutineDraft): AiRoutineDraft {
    return {
      ...draft,
      days: draft.days.map((day, dayIndex) => ({
        ...day,
        order: dayIndex + 1,
        exercises: day.exercises.map((exercise, exerciseIndex) => ({
          ...exercise,
          order: exerciseIndex + 1,
        })),
      })),
    };
  }

  private replaceInvalidExerciseRepeats(
    draft: AiRoutineDraft,
    catalog: Awaited<ReturnType<RoutineAiService['loadCatalog']>>,
  ): AiRoutineDraft {
    let previousDayExerciseIds = new Set<string>();

    return {
      ...draft,
      days: draft.days.map((day) => {
        const used = new Set<string>();
        let nextReplacementIndex = 0;

        const nextDay = {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (
              !used.has(exercise.exerciseId) &&
              !previousDayExerciseIds.has(exercise.exerciseId)
            ) {
              used.add(exercise.exerciseId);
              return exercise;
            }

            const replacement = this.nextUnusedExercise(
              catalog,
              new Set([...used, ...previousDayExerciseIds]),
              nextReplacementIndex,
            );

            if (!replacement) {
              return exercise;
            }

            nextReplacementIndex = replacement.nextIndex;
            used.add(replacement.exercise.id);

            return {
              ...exercise,
              exerciseId: replacement.exercise.id,
              observations: this.appendReviewObservation(exercise.observations),
            };
          }),
        };

        previousDayExerciseIds = used;
        return nextDay;
      }),
    };
  }

  private nextUnusedExercise(
    catalog: Awaited<ReturnType<RoutineAiService['loadCatalog']>>,
    used: Set<string>,
    startIndex: number,
  ) {
    for (let offset = 0; offset < catalog.length; offset += 1) {
      const index = (startIndex + offset) % catalog.length;
      const exercise = catalog[index];

      if (!used.has(exercise.id)) {
        return { exercise, nextIndex: index + 1 };
      }
    }

    return null;
  }

  private appendReviewObservation(observations: string) {
    const note =
      'Reemplazo automatico por repeticion de ejercicio; revisar parametros.';

    return observations.includes(note)
      ? observations
      : `${observations.trim()} ${note}`.trim();
  }

  private extractOutputText(payload: Record<string, unknown>) {
    if (typeof payload.output_text === 'string') {
      return payload.output_text;
    }

    const output = Array.isArray(payload.output) ? payload.output : [];
    for (const item of output) {
      const record = this.asRecord(item);
      const content = Array.isArray(record.content) ? record.content : [];
      for (const contentItem of content) {
        const contentRecord = this.asRecord(contentItem);
        if (
          contentRecord.type === 'output_text' &&
          typeof contentRecord.text === 'string'
        ) {
          return contentRecord.text;
        }
        if (typeof contentRecord.text === 'string') {
          return contentRecord.text;
        }
      }
    }

    return null;
  }

  private providerErrorMessage(status: number, rawText: string) {
    const providerError = this.parseProviderError(rawText);
    const code = providerError.code?.toLowerCase();
    const message = providerError.message?.toLowerCase() ?? '';

    if (status === 401) {
      return 'AI provider authentication failed.';
    }

    if (status === 429 && code === 'insufficient_quota') {
      return 'AI provider quota exceeded.';
    }

    if (status === 429) {
      return 'AI provider rate limit exceeded.';
    }

    if (
      message.includes('model') &&
      (message.includes('does not exist') || message.includes('not found'))
    ) {
      return 'AI provider model is not available.';
    }

    return 'AI provider request failed.';
  }

  private parseProviderError(rawText: string) {
    try {
      const parsed = JSON.parse(rawText) as {
        error?: { message?: string; code?: string | null };
      };

      return {
        message: parsed.error?.message,
        code: parsed.error?.code ?? undefined,
      };
    } catch {
      return {};
    }
  }

  private calculateTrainingDayTotal(
    startDate: string,
    endDate: string,
    daysPerWeek: number,
  ) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const calendarDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return Math.ceil((calendarDays / 7) * daysPerWeek);
  }

  private validateDateRange(startDate: string, endDate: string) {
    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date cannot be after end date.');
    }
  }

  private assertTrainer(user: User) {
    if (user.role !== UserRole.TRAINER) {
      throw new ForbiddenException('Trainer role is required.');
    }
  }

  private assertUniqueOrders(orders: number[], message: string) {
    if (new Set(orders).size !== orders.length) {
      throw new BadRequestException(message);
    }
  }

  private buildRoutineDescription(draft: AiRoutineDraft) {
    const lines = [
      draft.summary,
      `Estructura semanal: ${draft.weeklyStructure}.`,
      `Distribucion muscular: ${draft.muscleDistribution.join(', ')}.`,
    ];

    if (draft.catalogWarnings.length) {
      lines.push(`Advertencias de catalogo: ${draft.catalogWarnings.join(' ')}`);
    }

    return lines.join('\n');
  }

  private inputSummary(
    dto: GenerateRoutineAiDraftDto,
    targetDayCount: number,
    catalogItems: number,
  ): Prisma.InputJsonObject {
    return {
      studentId: dto.studentId,
      goal: dto.goal,
      startDate: dto.startDate,
      endDate: dto.endDate,
      daysPerWeek: dto.daysPerWeek,
      exercisesPerDay: dto.exercisesPerDay,
      targetDayCount,
      catalogItems,
    };
  }

  private outputSummary(draft: AiRoutineDraft): Prisma.InputJsonObject {
    return {
      summary: draft.summary,
      weeklyStructure: draft.weeklyStructure,
      muscleDistribution: draft.muscleDistribution,
      catalogWarnings: draft.catalogWarnings,
      days: draft.days.length,
      exercises: draft.days.reduce((sum, day) => sum + day.exercises.length, 0),
    };
  }

  private uniqueStrings(values: string[]) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }

  private async markAiLog(
    id: string,
    status: AiLogStatus,
    input: { error?: string },
  ) {
    await this.prisma.aiLog.update({
      where: { id },
      data: {
        status,
        error: input.error?.slice(0, 2000) ?? null,
      },
    });
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
}
