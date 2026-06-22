'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { env } from '@/lib/env';
import {
  CreateTrainingFeedbackPayload,
  PublicLinkFeedbackStatus,
  PublicLinkTrainingSession,
  PublicLinkTrainingSessionExercise,
  PublicRoutineExercise,
  PublicRoutinePayload,
} from '@/lib/api';

const goalLabels: Record<string, string> = {
  STRENGTH: 'Fuerza',
  MOBILITY: 'Movilidad',
  ENDURANCE: 'Cardio',
  POWER: 'Potencia',
  CORE: 'Core',
};

type ExerciseDraft = {
  completed: boolean;
  actualSets: string;
  actualRepetitions: string;
  actualLoad: string;
  actualRestSeconds: string;
  actualRir: string;
  actualRpe: string;
  trainerNotes: string;
};

const actualFields: Array<{
  label: string;
  field: keyof Pick<ExerciseDraft, 'actualSets' | 'actualRepetitions' | 'actualLoad' | 'actualRestSeconds' | 'actualRir' | 'actualRpe'>;
  type?: 'number' | 'text';
  min?: number;
  max?: number;
  placeholder?: string;
}> = [
  { label: 'Series reales', field: 'actualSets', type: 'number', min: 1, max: 20, placeholder: '4' },
  { label: 'Reps reales', field: 'actualRepetitions', placeholder: '10,10,9,8' },
  { label: 'Carga usada', field: 'actualLoad', placeholder: '60kg' },
  { label: 'Descanso real', field: 'actualRestSeconds', type: 'number', min: 0, max: 3600, placeholder: '90' },
  { label: 'RIR real', field: 'actualRir', type: 'number', min: 0, max: 10, placeholder: '2' },
  { label: 'RPE real', field: 'actualRpe', type: 'number', min: 1, max: 10, placeholder: '8' },
];

type FeedbackDraft = {
  difficultyScore: string;
  energyScore: string;
  completedWorkout: boolean;
  incompleteReason: string;
  hadDiscomfort: boolean;
  discomfortArea: string;
  discomfortIntensity: string;
  discomfortDescription: string;
  generalComment: string;
};

const defaultFeedbackDraft: FeedbackDraft = {
  difficultyScore: '5',
  energyScore: '5',
  completedWorkout: true,
  incompleteReason: '',
  hadDiscomfort: false,
  discomfortArea: '',
  discomfortIntensity: '5',
  discomfortDescription: '',
  generalComment: '',
};

function valueOrDash(value?: string | number | null) {
  return value !== null && value !== undefined && value !== '' ? value : '-';
}

function formatRest(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return null;
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function textFromUnknown(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function getSnapshotExercise(item: PublicLinkTrainingSessionExercise): PublicRoutineExercise['exercise'] | null {
  if (!isRecord(item.exerciseSnapshot)) return null;
  const exercise = item.exerciseSnapshot.exercise;
  if (!isRecord(exercise)) return null;

  return {
    name: textFromUnknown(exercise.name) ?? item.exerciseName,
    description: textFromUnknown(exercise.description),
    primaryMuscleGroup: textFromUnknown(exercise.primaryMuscleGroup),
    movementPattern: textFromUnknown(exercise.movementPattern),
    equipmentNeeded: textFromUnknown(exercise.equipmentNeeded),
    equipmentType: textFromUnknown(exercise.equipmentType),
    technicalInstructions: textFromUnknown(exercise.technicalInstructions),
    commonMistakes: textFromUnknown(exercise.commonMistakes),
    contraindications: textFromUnknown(exercise.contraindications),
    videoUrl: textFromUnknown(exercise.videoUrl) ?? item.exerciseVideoUrl,
    imageUrl: textFromUnknown(exercise.imageUrl) ?? item.exerciseImageUrl,
  };
}

function exerciseMeta(exercise: PublicRoutineExercise['exercise']) {
  return [exercise.primaryMuscleGroup, exercise.movementPattern, exercise.equipmentNeeded].filter(Boolean).join(' · ');
}

function ExerciseDetails({ exercise, observations }: { exercise: PublicRoutineExercise['exercise']; observations?: string | null }) {
  const details = [
    { label: 'Descripción', value: exercise.description },
    { label: 'Grupo', value: exercise.primaryMuscleGroup },
    { label: 'Patrón', value: exercise.movementPattern },
    { label: 'Equipo', value: exercise.equipmentNeeded },
    { label: 'Instrucciones', value: exercise.technicalInstructions },
    { label: 'Errores comunes', value: exercise.commonMistakes },
    { label: 'Precauciones', value: exercise.contraindications },
    { label: 'Observaciones', value: observations },
  ].filter((item) => item.value);

  if (details.length === 0 && !exercise.videoUrl) return null;

  return (
    <div className="mt-4 border-t border-[#e6e9ed] pt-4">
      <div className="space-y-3">
        {details.map((item) => (
          <div key={item.label}>
            <p className="text-[11px] font-black uppercase text-[#009a44]">{item.label}</p>
            <p className="mt-1 text-sm leading-6 text-[#56616b]">{item.value}</p>
          </div>
        ))}
      </div>
      {exercise.videoUrl ? (
        <a
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[8px] border border-[#a8adb3] bg-white text-sm font-black text-[#d14352]"
          href={exercise.videoUrl}
          rel="noreferrer"
          target="_blank"
        >
          Ver video de técnica
        </a>
      ) : null}
    </div>
  );
}

function PlannedStats({
  sets,
  repetitions,
  restSeconds,
  intensity,
}: {
  sets?: number | null;
  repetitions?: string | null;
  restSeconds?: number | null;
  intensity?: string | null;
}) {
  return (
    <p className="mt-5 text-[15px] leading-6 text-[#6c747c]">
      Series: {valueOrDash(sets)} | Repeticiones: {valueOrDash(repetitions)}
      {restSeconds !== null && restSeconds !== undefined ? ` | Descanso: ${formatRest(restSeconds)}` : ''}
      {intensity ? ` | Intensidad: ${intensity}` : ''}
    </p>
  );
}

const genericPublicErrorMessage = 'No pudimos completar la acción. Intentá de nuevo.';
const knownPublicMessages: Record<string, string> = {
  'Completed training days cannot be edited.': 'No se pueden editar dias de entrenamiento ya completados.',
  'Exercise not found.': 'No encontramos el ejercicio.',
  'Feedback already submitted for this training session.': 'El feedback ya fue enviado.',
  'Feedback not found.': 'No encontramos el feedback.',
  'No completed training day pending feedback.': 'No hay un día completado pendiente de feedback.',
  'Routine has no published snapshot yet.': 'La rutina todavía no tiene una versión publicada.',
  'Routine is not active.': 'La rutina no está activa.',
  'Routine not found.': 'No encontramos la rutina.',
  'Session is not in progress.': 'La sesión no está en progreso.',
  'This link is no longer available.': 'Este enlace ya no está disponible.',
  'Training session not found.': 'No encontramos la sesion de entrenamiento.',
  'Training day not found.': 'No encontramos el día de entrenamiento.',
};

function friendlyPublicMessage(message: unknown, fallback = genericPublicErrorMessage) {
  const rawMessage = Array.isArray(message) ? message[0] : message;

  if (typeof rawMessage !== 'string') {
    return fallback;
  }

  const trimmed = rawMessage.trim();
  if (!trimmed) {
    return fallback;
  }

  if (knownPublicMessages[trimmed]) {
    return knownPublicMessages[trimmed];
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.includes('json') ||
    lower.includes('syntaxerror') ||
    lower.includes('unexpected token') ||
    lower.includes('request failed') ||
    lower.includes('internal server error') ||
    lower.includes('must be') ||
    lower.includes('should not') ||
    lower.includes('is not a valid') ||
    lower.includes('uuid')
  ) {
    return fallback;
  }

  return fallback;
}

async function readPublicError(response: Response) {
  const text = await response.text().catch(() => '');

  if (!text) {
    return genericPublicErrorMessage;
  }

  try {
    const parsed = JSON.parse(text) as { message?: unknown; error?: unknown };
    return friendlyPublicMessage(parsed.message ?? parsed.error);
  } catch {
    return friendlyPublicMessage(text);
  }
}

function toDraft(item: PublicLinkTrainingSessionExercise): ExerciseDraft {
  return {
    completed: item.completed,
    actualSets: item.actualSets?.toString() ?? '',
    actualRepetitions: item.actualRepetitions ?? '',
    actualLoad: item.actualLoad ?? '',
    actualRestSeconds: item.actualRestSeconds?.toString() ?? '',
    actualRir: item.actualRir?.toString() ?? '',
    actualRpe: item.actualRpe?.toString() ?? '',
    trainerNotes: item.trainerNotes ?? '',
  };
}

async function publicFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);
  let response: Response;

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const error = new Error(await readPublicError(response)) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(genericPublicErrorMessage);
  }
}

function ErrorState({ title, text }: { title: string; text: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faf9] px-5 py-10 text-[#0f172a]">
      <section className="w-full max-w-md rounded-[8px] border border-[#dde5df] bg-white px-6 py-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf6ef] text-xl font-black text-[#087a3d]">
          P
        </div>
        <h1 className="mt-5 text-2xl font-black">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">{text}</p>
      </section>
    </main>
  );
}

function ScoreSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select
      className="mt-2 h-12 w-full rounded-[8px] border border-[#d8dee6] bg-white px-3 text-base outline-none focus:border-[#087a3d]"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
        <option key={score} value={score}>
          {score}
        </option>
      ))}
    </select>
  );
}

function ToggleYesNo({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-3">
      <button
        className={`h-12 rounded-[8px] text-sm font-black transition ${value ? 'bg-[#087a3d] text-white' : 'border border-[#d8dee6] text-[#334155]'}`}
        onClick={() => onChange(true)}
        type="button"
      >
        Sí
      </button>
      <button
        className={`h-12 rounded-[8px] text-sm font-black transition ${!value ? 'bg-[#087a3d] text-white' : 'border border-[#d8dee6] text-[#334155]'}`}
        onClick={() => onChange(false)}
        type="button"
      >
        No
      </button>
    </div>
  );
}

function FeedbackForm({
  dayName,
  draft,
  onChange,
  error,
  submitting,
  onSubmit,
}: {
  dayName: string;
  draft: FeedbackDraft;
  onChange: (next: Partial<FeedbackDraft>) => void;
  error: string;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f8faf9] px-5 py-8 text-[#0f172a]">
      <div className="mx-auto max-w-md space-y-5">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf6ef] text-xl font-black text-[#087a3d]">
            P
          </div>
          <h1 className="mt-4 text-2xl font-black">{dayName ? `¡${dayName} completado!` : '¡Entrenamiento registrado!'}</h1>
          <p className="mt-2 text-sm leading-6 text-[#64748b]">Contanos rápido cómo te fue.</p>
        </div>

        {error ? (
          <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p>
        ) : null}

        <section className="space-y-5 rounded-[8px] border border-[#dde5df] bg-white px-5 py-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <label className="block text-sm font-black text-[#334155]">
            Dificultad del entrenamiento (1-10)
            <ScoreSelect onChange={(value) => onChange({ difficultyScore: value })} value={draft.difficultyScore} />
          </label>

          <label className="block text-sm font-black text-[#334155]">
            Energía durante el entrenamiento (1-10)
            <ScoreSelect onChange={(value) => onChange({ energyScore: value })} value={draft.energyScore} />
          </label>

          <div>
            <p className="text-sm font-black text-[#334155]">¿Pudiste completar el entrenamiento?</p>
            <ToggleYesNo onChange={(value) => onChange({ completedWorkout: value })} value={draft.completedWorkout} />
          </div>

          {!draft.completedWorkout ? (
            <label className="block text-sm font-black text-[#334155]">
              ¿Por qué no pudiste completarlo?
              <textarea
                className="mt-2 min-h-20 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d]"
                onChange={(event) => onChange({ incompleteReason: event.target.value })}
                value={draft.incompleteReason}
              />
            </label>
          ) : null}

          <div>
            <p className="text-sm font-black text-[#334155]">¿Tuviste alguna molestia?</p>
            <ToggleYesNo onChange={(value) => onChange({ hadDiscomfort: value })} value={draft.hadDiscomfort} />
          </div>

          {draft.hadDiscomfort ? (
            <div className="space-y-4 rounded-[8px] bg-[#fef2f2] p-4">
              <label className="block text-sm font-black text-[#7f1d1d]">
                Zona de la molestia
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d]"
                  onChange={(event) => onChange({ discomfortArea: event.target.value })}
                  placeholder="Hombro derecho"
                  value={draft.discomfortArea}
                />
              </label>
              <label className="block text-sm font-black text-[#7f1d1d]">
                Intensidad de la molestia (1-10)
                <ScoreSelect onChange={(value) => onChange({ discomfortIntensity: value })} value={draft.discomfortIntensity} />
              </label>
              <label className="block text-sm font-black text-[#7f1d1d]">
                Descripción (opcional)
                <textarea
                  className="mt-2 min-h-20 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d]"
                  onChange={(event) => onChange({ discomfortDescription: event.target.value })}
                  value={draft.discomfortDescription}
                />
              </label>
            </div>
          ) : null}

          <label className="block text-sm font-black text-[#334155]">
            Comentario general (opcional)
            <textarea
              className="mt-2 min-h-20 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d]"
              onChange={(event) => onChange({ generalComment: event.target.value })}
              value={draft.generalComment}
            />
          </label>

          <button
            className="h-12 w-full rounded-[8px] bg-[#087a3d] text-base font-black text-white shadow-[0_14px_28px_rgba(8,122,61,0.18)] transition hover:bg-[#076b36] disabled:opacity-60"
            disabled={submitting}
            onClick={onSubmit}
            type="button"
          >
            {submitting ? 'Enviando...' : 'Enviar feedback'}
          </button>
        </section>
      </div>
    </main>
  );
}

export default function PublicRoutinePage() {
  const params = useParams<{ token: string }>();
  const [routine, setRoutine] = useState<PublicRoutinePayload | null>(null);
  const [session, setSession] = useState<PublicLinkTrainingSession | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ExerciseDraft>>({});
  const [error, setError] = useState<{ title: string; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState(0);
  const [openExerciseIds, setOpenExerciseIds] = useState<Record<string, boolean>>({});
  const [finishingDayId, setFinishingDayId] = useState('');
  const [savingExerciseId, setSavingExerciseId] = useState('');
  const [actionError, setActionError] = useState('');
  const [feedbackPending, setFeedbackPending] = useState(false);
  const [feedbackDayName, setFeedbackDayName] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState<FeedbackDraft>(defaultFeedbackDraft);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  function applySession(next: PublicLinkTrainingSession) {
    setSession(next);
    const nextDrafts: Record<string, ExerciseDraft> = {};
    next.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        nextDrafts[exercise.id] = toDraft(exercise);
      });
    });
    setDrafts(nextDrafts);
  }

  useEffect(() => {
    async function load() {
      try {
        const routineData = await publicFetch<PublicRoutinePayload>(`/public-routines/${params.token}`);
        setRoutine(routineData);
        setLoading(false);
      } catch (caught) {
        const status = (caught as { status?: number }).status;
        if (status === 403) {
          setError({
            title: 'Este enlace ya no está disponible',
            text: 'Pedile a tu entrenador un nuevo enlace si necesitás acceder a la rutina.',
          });
        } else {
          setError({
            title: 'Rutina no encontrada',
            text: 'El enlace puede estar mal escrito o haber dejado de existir.',
          });
        }
        setLoading(false);
        return;
      }

      let pendingFeedback = false;
      try {
        const feedbackStatus = await publicFetch<PublicLinkFeedbackStatus>(
          `/public-routines/${params.token}/training-session/feedback`,
        );
        pendingFeedback = Boolean(feedbackStatus?.pending);
        if (pendingFeedback) {
          setFeedbackDayName(feedbackStatus?.dayName ?? '');
        }
      } catch {
        // No bloquea la vista si falla la consulta de feedback pendiente.
      }

      if (pendingFeedback) {
        setFeedbackPending(true);
        return;
      }

      try {
        const current = await publicFetch<PublicLinkTrainingSession>(
          `/public-routines/${params.token}/training-session`,
          { method: 'POST' },
        );
        applySession(current);
      } catch {
        // Si no se puede iniciar (p.ej. la rutina ya no esta activa), se muestra la vista de solo lectura.
      }

    }

    void load();
  }, [params.token]);

  function updateDraft(exerciseId: string, next: Partial<ExerciseDraft>) {
    setDrafts((current) => ({ ...current, [exerciseId]: { ...current[exerciseId], ...next } }));
  }

  function toggleExerciseDetails(exerciseKey: string) {
    setOpenExerciseIds((current) => ({ ...current, [exerciseKey]: !current[exerciseKey] }));
  }

  async function saveExercise(exerciseId: string) {
    const draft = drafts[exerciseId];
    if (!draft) return;

    setSavingExerciseId(exerciseId);
    setActionError('');
    try {
      const updated = await publicFetch<PublicLinkTrainingSessionExercise>(
        `/public-routines/${params.token}/training-session/exercises/${exerciseId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            completed: draft.completed,
            actualSets: optionalNumber(draft.actualSets),
            actualRepetitions: optionalText(draft.actualRepetitions),
            actualLoad: optionalText(draft.actualLoad),
            actualRestSeconds: optionalNumber(draft.actualRestSeconds),
            actualRir: optionalNumber(draft.actualRir),
            actualRpe: optionalNumber(draft.actualRpe),
            trainerNotes: optionalText(draft.trainerNotes),
          }),
        },
      );
      setSession((current) =>
        current
          ? {
              ...current,
              days: current.days.map((day) => ({
                ...day,
                exercises: day.exercises.map((item) => (item.id === updated.id ? updated : item)),
              })),
            }
          : current,
      );
      setDrafts((current) => ({ ...current, [exerciseId]: toDraft(updated) }));
    } catch {
      setActionError('No pudimos guardar este ejercicio. Intentá de nuevo.');
    } finally {
      setSavingExerciseId('');
    }
  }

  async function finishDay(dayId: string) {
    setFinishingDayId(dayId);
    setActionError('');
    const dayName = session?.days.find((day) => day.id === dayId)?.name ?? '';
    try {
      await publicFetch<PublicLinkTrainingSession>(
        `/public-routines/${params.token}/training-session/days/${dayId}/complete`,
        { method: 'PATCH' },
      );
      setSession(null);
      setFeedbackDayName(dayName);
      setFeedbackPending(true);
    } catch {
      setActionError('No pudimos finalizar este día. Intentá de nuevo.');
    } finally {
      setFinishingDayId('');
    }
  }

  function updateFeedbackDraft(next: Partial<FeedbackDraft>) {
    setFeedbackDraft((current) => ({ ...current, ...next }));
  }

  async function submitFeedback() {
    setFeedbackError('');

    if (!feedbackDraft.completedWorkout && !optionalText(feedbackDraft.incompleteReason)) {
      setFeedbackError('Contanos brevemente por qué no pudiste completar el entrenamiento.');
      return;
    }

    if (feedbackDraft.hadDiscomfort && !optionalText(feedbackDraft.discomfortArea)) {
      setFeedbackError('Indicá la zona de la molestia.');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const payload: CreateTrainingFeedbackPayload = {
        difficultyScore: Number(feedbackDraft.difficultyScore),
        energyScore: Number(feedbackDraft.energyScore),
        completedWorkout: feedbackDraft.completedWorkout,
        incompleteReason: feedbackDraft.completedWorkout
          ? undefined
          : optionalText(feedbackDraft.incompleteReason),
        hadDiscomfort: feedbackDraft.hadDiscomfort,
        discomfortArea: feedbackDraft.hadDiscomfort ? optionalText(feedbackDraft.discomfortArea) : undefined,
        discomfortIntensity: feedbackDraft.hadDiscomfort ? Number(feedbackDraft.discomfortIntensity) : undefined,
        discomfortDescription: feedbackDraft.hadDiscomfort
          ? optionalText(feedbackDraft.discomfortDescription)
          : undefined,
        generalComment: optionalText(feedbackDraft.generalComment),
      };

      await publicFetch(`/public-routines/${params.token}/training-session/feedback`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setFeedbackPending(false);
      setFeedbackNotice(
        feedbackDayName
          ? `¡Feedback de ${feedbackDayName} enviado! Gracias por contarnos cómo te fue.`
          : '¡Feedback enviado! Gracias por contarnos cómo te fue.',
      );
      setFeedbackDayName('');
      setFeedbackDraft(defaultFeedbackDraft);
    } catch {
      setFeedbackError('No pudimos enviar tu feedback. Intentá de nuevo.');
    } finally {
      setSubmittingFeedback(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf9] px-5 py-10 text-[#0f172a]">
        <p className="rounded-[8px] border border-[#dde5df] bg-white px-4 py-3 text-sm text-[#64748b]">Cargando rutina...</p>
      </main>
    );
  }

  if (feedbackPending) {
    return (
      <FeedbackForm
        dayName={feedbackDayName}
        draft={feedbackDraft}
        error={feedbackError}
        onChange={updateFeedbackDraft}
        onSubmit={submitFeedback}
        submitting={submittingFeedback}
      />
    );
  }

  if (error) {
    return <ErrorState title={error.title} text={error.text} />;
  }

  if (!routine) {
    return <ErrorState title="Rutina no encontrada" text="No hay datos disponibles para este enlace." />;
  }

  const studentName = `${routine.student?.firstName ?? ''} ${routine.student?.lastName ?? ''}`.trim();
  const trainerName = `${routine.trainer?.firstName ?? ''} ${routine.trainer?.lastName ?? ''}`.trim();
  const isActive = session?.status === 'IN_PROGRESS';

  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#0f172a]">
      <header className="border-b border-[#dfe7e2] bg-white px-5 py-5">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#087a3d] text-lg font-black text-white">
              P
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#087a3d]">Rutina publicada</p>
              <h1 className="text-2xl font-black tracking-[-0.03em]">{routine.routine?.name ?? 'Rutina'}</h1>
            </div>
          </div>
          {routine.routine?.description ? (
            <p className="mt-4 text-sm leading-6 text-[#475569]">{routine.routine.description}</p>
          ) : null}
          <div className="mt-5 grid gap-3 rounded-[8px] bg-[#f8faf9] p-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase text-[#64748b]">Alumno</p>
              <p className="mt-1 font-black">{valueOrDash(studentName)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-[#64748b]">Entrenador</p>
              <p className="mt-1 font-black">{valueOrDash(trainerName)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-[#64748b]">Objetivo</p>
              <p className="mt-1 font-black">
                {routine.routine?.goal ? goalLabels[routine.routine.goal] : '-'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl space-y-4 px-5 py-6">
        {feedbackNotice ? (
          <p className="rounded-[8px] border border-[#b8dec7] bg-white px-4 py-3 text-sm text-[#087a3d]">{feedbackNotice}</p>
        ) : null}

        {actionError ? (
          <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{actionError}</p>
        ) : null}

        {isActive ? (
          <p className="rounded-[8px] border border-[#b8dec7] bg-white px-5 py-4 text-sm font-black text-[#087a3d]">
            Marcá cada ejercicio a medida que lo hacés, guardá los datos reales y finalizá el día cuando termines.
          </p>
        ) : null}

        {(isActive && session ? session.days : routine.days)
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((day, dayIndex) => {
            const isOpen = openDay === dayIndex;
            const dayCompletedAt = isActive && session ? session.days[dayIndex].completedAt : null;
            return (
              <article className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]" key={`${day.order}-${day.name}`}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenDay(isOpen ? -1 : dayIndex)}
                  type="button"
                >
                  <div>
                    <p className="text-xs font-black uppercase text-[#087a3d]">Día {day.order}</p>
                    <h2 className="mt-1 text-lg font-black">{day.name}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {dayCompletedAt ? (
                      <span className="rounded-full bg-[#eaf6ef] px-3 py-1 text-xs font-black text-[#087a3d]">Día completado</span>
                    ) : null}
                    <span className="text-sm font-black text-[#64748b]">{isOpen ? 'Cerrar' : 'Abrir'}</span>
                  </div>
                </button>

                {isOpen ? (
                  <div className="space-y-4 border-t border-[#edf1ee] px-5 py-5">
                    {isActive && session
                      ? session.days[dayIndex].exercises
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((item) => {
                            const draft = drafts[item.id] ?? toDraft(item);
                            const dayDone = Boolean(dayCompletedAt);
                            const exercise = getSnapshotExercise(item) ?? {
                              name: item.exerciseName,
                              imageUrl: item.exerciseImageUrl,
                              videoUrl: item.exerciseVideoUrl,
                            };
                            return (
                              <section className="relative overflow-hidden rounded-[8px] border border-[#e3e5e8] bg-[#fbfbfb] py-4 pl-7 pr-3 shadow-[0_3px_10px_rgba(15,23,42,0.12)]" key={item.id}>
                                <div className="absolute left-0 top-0 h-full w-[8px] bg-[#087a3d]" />
                                {item.exerciseImageUrl ? (
                                  <img
                                    alt={item.exerciseName}
                                    className="float-right ml-3 h-[96px] w-[124px] rounded-[8px] border border-[#e8e8e8] bg-white object-contain"
                                    src={item.exerciseImageUrl}
                                  />
                                ) : null}
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-[13px] text-[#757b82]">Series</p>
                                    <h3 className="mt-2 text-[24px] font-normal leading-[1.08] tracking-normal text-[#151515] sm:text-[28px]">{item.exerciseName}</h3>
                                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#7a8289]">{exerciseMeta(exercise)}</p>
                                  </div>
                                  {item.exerciseVideoUrl ? (
                                    <a
                                      className="shrink-0 rounded-[8px] border border-[#087a3d] bg-white px-3 py-2 text-sm font-black leading-none text-[#087a3d]"
                                      href={item.exerciseVideoUrl}
                                      rel="noreferrer"
                                      target="_blank"
                                    >
                                      Video
                                    </a>
                                  ) : null}
                                </div>

                                <PlannedStats
                                  intensity={item.plannedIntensity}
                                  repetitions={item.plannedRepetitions}
                                  restSeconds={item.plannedRestSeconds}
                                  sets={item.plannedSets}
                                />

                                <button
                                  className="mt-4 h-11 w-full rounded-[8px] border border-[#a8adb3] bg-white text-sm font-black text-[#d14352]"
                                  onClick={() => toggleExerciseDetails(item.id)}
                                  type="button"
                                >
                                  {openExerciseIds[item.id] ? 'Ocultar detalles' : 'Ver detalles'}
                                </button>
                                {openExerciseIds[item.id] ? (
                                  <>
                                    <div className="mt-3 rounded-[8px] border border-[#e6e9ed] bg-white p-3">
                                      <p className="text-[11px] font-black uppercase text-[#009a44]">Tu carga</p>
                                      <label className="mt-3 flex items-center gap-2 text-sm font-black text-[#087a3d]">
                                        <input
                                          checked={draft.completed}
                                          className="h-5 w-5 accent-[#087a3d]"
                                          disabled={dayDone}
                                          onChange={(event) => updateDraft(item.id, { completed: event.target.checked })}
                                          type="checkbox"
                                        />
                                        Hecho
                                      </label>
                                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {actualFields.map(({ label, field, type = 'text', min, max, placeholder }) => (
                                          <label className="text-xs font-black text-[#64748b]" key={field}>
                                            {label}
                                            <input
                                              className="mt-1 h-10 w-full rounded-[8px] border border-[#d8dee6] px-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]"
                                              disabled={dayDone}
                                              max={max}
                                              min={min}
                                              onChange={(event) => updateDraft(item.id, { [field]: event.target.value })}
                                              placeholder={placeholder}
                                              type={type}
                                              value={draft[field]}
                                            />
                                          </label>
                                        ))}
                                      </div>
                                      <label className="mt-3 block text-xs font-black text-[#64748b]">
                                        Notas
                                        <textarea
                                          className="mt-1 min-h-16 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]"
                                          disabled={dayDone}
                                          onChange={(event) => updateDraft(item.id, { trainerNotes: event.target.value })}
                                          value={draft.trainerNotes}
                                        />
                                      </label>
                                      {!dayDone ? (
                                        <div className="mt-3 flex justify-end">
                                          <button
                                            className="h-10 rounded-[8px] bg-[#087a3d] px-4 text-sm font-black text-white transition hover:bg-[#076b36] disabled:opacity-60"
                                            disabled={savingExerciseId === item.id}
                                            onClick={() => saveExercise(item.id)}
                                            type="button"
                                          >
                                            {savingExerciseId === item.id ? 'Guardando...' : 'Guardar'}
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                              </section>
                            );
                          })
                      : routine.days[dayIndex].exercises
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((item) => (
                            <section className="rounded-[8px] border border-[#e5e7eb] p-4" key={`${item.order}-${item.exercise.name}`}>
                              {item.exercise.imageUrl ? (
                                <img
                                  alt={item.exercise.name}
                                  className="mb-4 aspect-video w-full rounded-[8px] object-cover"
                                  src={item.exercise.imageUrl}
                                />
                              ) : null}
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-xs font-black uppercase text-[#64748b]">Ejercicio {item.order}</p>
                                  <h3 className="mt-1 text-lg font-black">{item.exercise.name}</h3>
                                  <p className="mt-1 text-sm text-[#64748b]">
                                    {[item.exercise.primaryMuscleGroup, item.exercise.equipmentNeeded].filter(Boolean).join(' · ')}
                                  </p>
                                </div>
                                {item.exercise.videoUrl ? (
                                  <a
                                    className="shrink-0 rounded-[8px] bg-[#087a3d] px-3 py-2 text-sm font-black text-white"
                                    href={item.exercise.videoUrl}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    Video
                                  </a>
                                ) : null}
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                                <div className="rounded-[8px] bg-[#f8faf9] p-3">
                                  <p className="text-xs font-black uppercase text-[#64748b]">Series</p>
                                  <p className="mt-1 font-black">{valueOrDash(item.sets)}</p>
                                </div>
                                <div className="rounded-[8px] bg-[#f8faf9] p-3">
                                  <p className="text-xs font-black uppercase text-[#64748b]">Reps</p>
                                  <p className="mt-1 font-black">{valueOrDash(item.repetitions)}</p>
                                </div>
                                <div className="rounded-[8px] bg-[#f8faf9] p-3">
                                  <p className="text-xs font-black uppercase text-[#64748b]">Descanso</p>
                                  <p className="mt-1 font-black">{valueOrDash(formatRest(item.restSeconds))}</p>
                                </div>
                                <div className="rounded-[8px] bg-[#f8faf9] p-3">
                                  <p className="text-xs font-black uppercase text-[#64748b]">Tempo</p>
                                  <p className="mt-1 font-black">{valueOrDash(item.tempo)}</p>
                                </div>
                                <div className="rounded-[8px] bg-[#f8faf9] p-3">
                                  <p className="text-xs font-black uppercase text-[#64748b]">Intensidad</p>
                                  <p className="mt-1 font-black">{valueOrDash(item.intensity)}</p>
                                </div>
                                <div className="rounded-[8px] bg-[#f8faf9] p-3">
                                  <p className="text-xs font-black uppercase text-[#64748b]">RIR</p>
                                  <p className="mt-1 font-black">{valueOrDash(item.rir)}</p>
                                </div>
                                <div className="rounded-[8px] bg-[#f8faf9] p-3">
                                  <p className="text-xs font-black uppercase text-[#64748b]">RPE</p>
                                  <p className="mt-1 font-black">{valueOrDash(item.rpe)}</p>
                                </div>
                              </div>

                              {item.observations ? (
                                <p className="mt-4 rounded-[8px] bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#7c2d12]">
                                  {item.observations}
                                </p>
                              ) : null}
                            </section>
                          ))}

                    {isActive && session && !dayCompletedAt ? (
                      <button
                        className="h-12 w-full rounded-[8px] bg-[#0f172a] text-sm font-black text-white transition hover:bg-[#1e293b] disabled:opacity-60"
                        disabled={finishingDayId === session.days[dayIndex].id}
                        onClick={() => finishDay(session.days[dayIndex].id)}
                        type="button"
                      >
                        {finishingDayId === session.days[dayIndex].id ? 'Finalizando...' : `Finalizar ${day.name}`}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
      </section>
    </main>
  );
}
