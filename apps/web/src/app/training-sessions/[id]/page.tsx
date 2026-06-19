'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, LocalUser, TrainingFeedback, TrainingSession, TrainingSessionExercise, TrainingSessionStatus } from '@/lib/api';

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

const statusLabels: Record<TrainingSessionStatus, string> = {
  PLANNED: 'Planificada',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const plannedFields: Array<{
  label: string;
  field: keyof Pick<
    TrainingSessionExercise,
    'plannedSets' | 'plannedRepetitions' | 'plannedRestSeconds' | 'plannedIntensity' | 'plannedTempo' | 'plannedRir' | 'plannedRpe'
  >;
}> = [
  { label: 'Series', field: 'plannedSets' },
  { label: 'Reps', field: 'plannedRepetitions' },
  { label: 'Descanso', field: 'plannedRestSeconds' },
  { label: 'Intensidad', field: 'plannedIntensity' },
  { label: 'Tempo', field: 'plannedTempo' },
  { label: 'RIR', field: 'plannedRir' },
  { label: 'RPE', field: 'plannedRpe' },
];

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

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function dateInput(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDraft(item: TrainingSessionExercise): ExerciseDraft {
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold text-[#334155]">
      {label}
      {children}
    </label>
  );
}

export default function TrainingSessionDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [feedbacks, setFeedbacks] = useState<TrainingFeedback[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [drafts, setDrafts] = useState<Record<string, ExerciseDraft>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingExerciseId, setSavingExerciseId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [sessionRow, authSession] = await Promise.all([
        apiFetch<TrainingSession>(`/training-sessions/${params.id}`),
        apiFetch<{ user: LocalUser }>('/auth/session'),
      ]);
      const feedbackResult = await apiFetch<TrainingFeedback[]>(
        `/training-sessions/${params.id}/feedback`,
      ).catch(() => []);

      setUser(authSession.user);
      setSession(sessionRow);
      setFeedbacks(feedbackResult);
      setScheduledDate(dateInput(sessionRow.scheduledDate));
      setNotes(sessionRow.notes ?? '');
      const nextDrafts: Record<string, ExerciseDraft> = {};
      sessionRow.days.forEach((day) => {
        day.exercises.forEach((exercise) => {
          nextDrafts[exercise.id] = toDraft(exercise);
        });
      });
      setDrafts(nextDrafts);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar la sesión.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  function updateDraft(exerciseId: string, next: Partial<ExerciseDraft>) {
    setDrafts((current) => ({ ...current, [exerciseId]: { ...current[exerciseId], ...next } }));
  }

  async function saveSessionInfo() {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const updated = await apiFetch<TrainingSession>(`/training-sessions/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          scheduledDate: optionalText(scheduledDate),
          notes: optionalText(notes),
        }),
      });
      setSession(updated);
      setNotice('Sesión actualizada.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar la sesión.');
    } finally {
      setSaving(false);
    }
  }

  async function transitionSession(action: 'start' | 'complete' | 'cancel') {
    if (action === 'cancel' && !window.confirm('Cancelar esta sesión de entrenamiento?')) return;
    if (action === 'complete' && !window.confirm('Marcar esta sesión como completada?')) return;

    setSaving(true);
    setError('');
    setNotice('');
    try {
      const updated = await apiFetch<TrainingSession>(`/training-sessions/${params.id}/${action}`, {
        method: 'PATCH',
      });
      setSession(updated);
      setNotice(
        action === 'start'
          ? 'Sesión iniciada.'
          : action === 'complete'
            ? 'Sesión completada.'
            : 'Sesión cancelada.',
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo actualizar la sesión.');
    } finally {
      setSaving(false);
    }
  }

  async function saveExercise(exerciseId: string) {
    const draft = drafts[exerciseId];
    if (!draft) return;

    setSavingExerciseId(exerciseId);
    setError('');
    setNotice('');
    try {
      const updated = await apiFetch<TrainingSessionExercise>(`/training-sessions/exercises/${exerciseId}`, {
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
      });
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
      setNotice('Ejercicio registrado.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo registrar el ejercicio.');
    } finally {
      setSavingExerciseId('');
    }
  }

  if (loading) {
    return <p className="rounded-[8px] border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#64748b]">Cargando...</p>;
  }

  if (error && !session) {
    return (
      <div className="space-y-4">
        <Link className="text-sm font-black text-[#087a3d]" href="/training-sessions">Volver a entrenamientos</Link>
        <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p>
      </div>
    );
  }

  if (!session) return null;

  const isOwnerTrainer = user?.role === 'TRAINER' && session.trainerId === user.id;
  const isClosed = session.status === 'COMPLETED' || session.status === 'CANCELLED';
  const canMutate = isOwnerTrainer && !isClosed;

  return (
    <div className="space-y-7">
      <nav className="text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/training-sessions">Entrenamientos</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[#1e293b]">{session.routine.name}</span>
      </nav>

      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-[#0f172a]">{session.routine.name}</h1>
            <span className="rounded-full bg-[#eaf6ef] px-3 py-1 text-xs font-black text-[#087a3d]">
              {statusLabels[session.status]}
            </span>
          </div>
          <p className="mt-2 text-base text-[#6b7280]">
            {session.student.firstName} {session.student.lastName} · version {session.routineVersion}
          </p>
        </div>
        {isOwnerTrainer ? (
          <div className="flex flex-wrap gap-3">
            {session.status === 'PLANNED' ? (
              <button className="h-11 rounded-[8px] bg-[#0f172a] px-5 text-sm font-black text-white transition hover:bg-[#1e293b] disabled:opacity-60" disabled={saving} onClick={() => transitionSession('start')} type="button">
                Iniciar
              </button>
            ) : null}
            {!isClosed ? (
              <>
                <button className="h-11 rounded-[8px] bg-[#087a3d] px-5 text-sm font-black text-white transition hover:bg-[#076b36] disabled:opacity-60" disabled={saving} onClick={() => transitionSession('complete')} type="button">
                  Completar
                </button>
                <button className="h-11 rounded-[8px] border border-[#f3c5c1] px-5 text-sm font-black text-[#b3261e] transition hover:bg-[#fff7f7] disabled:opacity-60" disabled={saving} onClick={() => transitionSession('cancel')} type="button">
                  Cancelar
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </header>

      {error ? <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p> : null}
      {notice ? <p className="rounded-[8px] border border-[#b8dec7] bg-white px-4 py-3 text-sm text-[#087a3d]">{notice}</p> : null}

      <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#edf1ee] px-6 py-5">
          <h2 className="text-lg font-black text-[#0f172a]">Información general</h2>
        </div>
        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <Field label="Fecha programada">
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]"
              disabled={!canMutate}
              type="date"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
            />
          </Field>
          <Field label="Iniciada">
            <p className="mt-2 h-11 flex items-center text-sm text-[#475569]">{formatDateTime(session.startedAt)}</p>
          </Field>
          <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
            Notas
            <textarea
              className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]"
              disabled={!canMutate}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>
        {canMutate ? (
          <div className="flex justify-end border-t border-[#edf1ee] px-6 py-4">
            <button className="h-10 rounded-[8px] bg-[#087a3d] px-5 text-sm font-black text-white transition hover:bg-[#076b36] disabled:opacity-60" disabled={saving} onClick={saveSessionInfo} type="button">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        ) : null}
      </section>

      <section className="space-y-5">
        {session.days.map((day) => (
          <article className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] scroll-mt-6" id={day.id} key={day.id}>
            <div className="flex items-center gap-3 border-b border-[#edf1ee] px-6 py-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-sm font-black text-[#087a3d]">{day.order}</span>
              <h3 className="text-base font-black text-[#0f172a]">{day.name}</h3>
              {day.completedAt ? (
                <span className="ml-auto rounded-full bg-[#eaf6ef] px-3 py-1 text-xs font-black text-[#087a3d]">
                  Completado el {new Date(day.completedAt).toLocaleDateString('es-AR')}
                </span>
              ) : null}
            </div>

            <div className="space-y-5 px-6 py-5">
              {day.exercises.map((item) => {
                const draft = drafts[item.id] ?? toDraft(item);
                return (
                  <div className="rounded-[8px] border border-[#e5e7eb] p-4" key={item.id}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-base font-black text-[#0f172a]">{item.order}. {item.exerciseName}</p>
                        {item.exerciseVideoUrl ? (
                          <a className="mt-1 inline-block text-sm font-semibold text-[#087a3d] hover:underline" href={item.exerciseVideoUrl} rel="noreferrer" target="_blank">
                            Ver video
                          </a>
                        ) : null}
                      </div>
                      <label className="flex items-center gap-2 text-sm font-black text-[#334155]">
                        <input
                          checked={draft.completed}
                          className="h-4 w-4"
                          disabled={!canMutate}
                          onChange={(event) => updateDraft(item.id, { completed: event.target.checked })}
                          type="checkbox"
                        />
                        Completado
                      </label>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
                      {plannedFields.map(({ label, field }) => (
                        <div className="text-xs font-black text-[#94a3b8]" key={field}>
                          {label} (plan.)
                          <p className="mt-1 text-sm font-semibold text-[#475569]">{item[field] ?? '-'}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3 rounded-[8px] bg-[#f8faf9] p-4 md:grid-cols-3 xl:grid-cols-6">
                      {actualFields.map(({ label, field, type = 'text', min, max, placeholder }) => (
                        <label className="text-xs font-black text-[#64748b]" key={field}>
                          {label}
                          <input
                            className="mt-1 h-9 w-full rounded-[8px] border border-[#d8dee6] px-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d] disabled:bg-white"
                            disabled={!canMutate}
                            max={max}
                            min={min}
                            placeholder={placeholder}
                            type={type}
                            value={draft[field]}
                            onChange={(event) => updateDraft(item.id, { [field]: event.target.value })}
                          />
                        </label>
                      ))}
                    </div>
                    <label className="mt-3 block text-xs font-black text-[#64748b]">
                      Notas del entrenador
                      <textarea
                        className="mt-1 min-h-16 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]"
                        disabled={!canMutate}
                        value={draft.trainerNotes}
                        onChange={(event) => updateDraft(item.id, { trainerNotes: event.target.value })}
                      />
                    </label>
                    {canMutate ? (
                      <div className="mt-3 flex justify-end">
                        <button
                          className="h-9 rounded-[8px] bg-[#087a3d] px-4 text-xs font-black text-white transition hover:bg-[#076b36] disabled:opacity-60"
                          disabled={savingExerciseId === item.id}
                          onClick={() => saveExercise(item.id)}
                          type="button"
                        >
                          {savingExerciseId === item.id ? 'Guardando...' : 'Guardar ejercicio'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {!day.exercises.length ? <p className="rounded-[8px] bg-[#f8faf9] px-4 py-5 text-center text-sm text-[#64748b]">Este dia no tiene ejercicios.</p> : null}
            </div>

            <div className="border-t border-[#edf1ee] px-6 py-5">
              <h4 className="text-sm font-black uppercase tracking-wide text-[#64748b]">Feedback del alumno</h4>
              {(() => {
                const dayFeedback = feedbacks.find((item) => item.trainingSessionDayId === day.id);
                if (!dayFeedback) {
                  return (
                    <p className="mt-3 text-sm text-[#64748b]">
                      {day.completedAt
                        ? 'El alumno todavía no envió feedback de este día.'
                        : 'El feedback aparece acá una vez que el alumno completa este día y lo envía.'}
                    </p>
                  );
                }
                return (
                  <div className="mt-3 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-black text-[#334155]">
                        Dificultad {dayFeedback.difficultyScore}/10
                      </span>
                      <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-black text-[#334155]">
                        Energía {dayFeedback.energyScore}/10
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${dayFeedback.completedWorkout ? 'bg-[#eaf6ef] text-[#087a3d]' : 'bg-[#fff7ed] text-[#c2410c]'}`}>
                        {dayFeedback.completedWorkout ? 'Completó' : 'No completó'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${dayFeedback.hadDiscomfort ? 'bg-[#fef2f2] text-[#b3261e]' : 'bg-[#f1f5f9] text-[#334155]'}`}>
                        {dayFeedback.hadDiscomfort ? 'Tuvo molestia' : 'Sin molestia'}
                      </span>
                    </div>
                    {!dayFeedback.completedWorkout && dayFeedback.incompleteReason ? (
                      <p className="text-sm text-[#475569]"><span className="font-black">Motivo:</span> {dayFeedback.incompleteReason}</p>
                    ) : null}
                    {dayFeedback.hadDiscomfort ? (
                      <div className="rounded-[8px] bg-[#fef2f2] px-4 py-3 text-sm text-[#7f1d1d]">
                        <p><span className="font-black">Zona:</span> {dayFeedback.discomfortArea ?? '-'}</p>
                        {dayFeedback.discomfortIntensity ? <p><span className="font-black">Intensidad:</span> {dayFeedback.discomfortIntensity}/10</p> : null}
                        {dayFeedback.discomfortDescription ? <p className="mt-1">{dayFeedback.discomfortDescription}</p> : null}
                      </div>
                    ) : null}
                    {dayFeedback.generalComment ? (
                      <p className="text-sm text-[#475569]"><span className="font-black">Comentario:</span> {dayFeedback.generalComment}</p>
                    ) : null}
                    <p className="text-xs text-[#94a3b8]">Enviado el {formatDateTime(dayFeedback.submittedAt)}</p>
                  </div>
                );
              })()}
            </div>
          </article>
        ))}
        {!session.days.length ? (
          <div className="rounded-[8px] border border-[#dde5df] bg-white px-6 py-10 text-center text-sm text-[#64748b]">
            Esta sesión no tiene dias cargados.
          </div>
        ) : null}
      </section>
    </div>
  );
}
