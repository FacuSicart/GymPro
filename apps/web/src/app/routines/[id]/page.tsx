'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, Exercise, ExerciseGoal, LocalUser, PublicRoutineLink, Routine, RoutineExercise, TrainingDay } from '@/lib/api';

type ExerciseDraft = {
  exerciseId: string;
  order: number;
  sets: string;
  repetitions: string;
  restSeconds: string;
  intensity: string;
  tempo: string;
  rir: string;
  rpe: string;
  observations: string;
};

type DayDraft = {
  name: string;
  order: number;
  exercises: ExerciseDraft[];
};

const goalLabels: Record<ExerciseGoal, string> = {
  STRENGTH: 'Fuerza',
  MOBILITY: 'Movilidad',
  ENDURANCE: 'Cardio',
  POWER: 'Potencia',
  CORE: 'Core',
};

const statusLabels = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  ARCHIVED: 'Archivada',
};

const executionFields: Array<{
  label: string;
  field: keyof Pick<
    ExerciseDraft,
    'sets' | 'repetitions' | 'restSeconds' | 'intensity' | 'tempo' | 'rir' | 'rpe'
  >;
  type?: 'number' | 'text';
  min?: number;
  max?: number;
  placeholder?: string;
}> = [
  { label: 'Series', field: 'sets', type: 'number', min: 1, max: 20, placeholder: '4' },
  { label: 'Reps', field: 'repetitions', placeholder: '8-12' },
  { label: 'Descanso', field: 'restSeconds', type: 'number', min: 0, max: 3600, placeholder: '90' },
  { label: 'Intensidad', field: 'intensity', placeholder: '70% 1RM' },
  { label: 'Tempo', field: 'tempo', placeholder: '3-1-1' },
  { label: 'RIR', field: 'rir', type: 'number', min: 0, max: 10, placeholder: '2' },
  { label: 'RPE', field: 'rpe', type: 'number', min: 1, max: 10, placeholder: '8' },
];

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function calculateTrainingDayTotal(startDate: string, endDate: string, daysPerWeek: string) {
  const weeklyDays = optionalNumber(daysPerWeek);
  if (!startDate || !endDate || !weeklyDays) {
    return null;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }

  const calendarDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.ceil((calendarDays / 7) * weeklyDays);
}

function dateInput(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

function toDraftExercise(item: RoutineExercise): ExerciseDraft {
  return {
    exerciseId: item.exerciseId,
    order: item.order,
    sets: item.sets?.toString() ?? '',
    repetitions: item.repetitions ?? '',
    restSeconds: item.restSeconds?.toString() ?? '',
    intensity: item.intensity ?? '',
    tempo: item.tempo ?? '',
    rir: item.rir?.toString() ?? '',
    rpe: item.rpe?.toString() ?? '',
    observations: item.observations ?? '',
  };
}

function toDraftDays(days: TrainingDay[]): DayDraft[] {
  return days
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((day, index) => ({
      name: `Dia ${index + 1}`,
      order: index + 1,
      exercises: day.exercises
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item, itemIndex) => ({ ...toDraftExercise(item), order: itemIndex + 1 })),
    }));
}

function normalizeOrders(days: DayDraft[]) {
  return days.map((day, dayIndex) => ({
    ...day,
    order: dayIndex + 1,
    name: `Dia ${dayIndex + 1}`,
    exercises: day.exercises.map((exercise, exerciseIndex) => ({
      ...exercise,
      order: exerciseIndex + 1,
    })),
  }));
}

function reorderList<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function isInteractiveDragTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('button, input, select, textarea'));
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold text-[#334155]">
      {label}
      {children}
    </label>
  );
}

export default function RoutineDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<ExerciseGoal | ''>('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState<DayDraft[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [patternFilter, setPatternFilter] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicLink, setPublicLink] = useState<PublicRoutineLink | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  const isArchived = routine?.status === 'ARCHIVED';
  const trainingDayTotal = useMemo(
    () => calculateTrainingDayTotal(startDate, endDate, daysPerWeek),
    [daysPerWeek, endDate, startDate],
  );

  const catalogOptions = useMemo(() => {
    const normalizedSearch = exerciseSearch.trim().toLowerCase();
    return catalog.filter((exercise) => {
      const matchesSearch = normalizedSearch
        ? exercise.name.toLowerCase().includes(normalizedSearch) ||
          exercise.primaryMuscleGroup.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesMuscle = muscleFilter ? exercise.primaryMuscleGroup === muscleFilter : true;
      const matchesGoal = goalFilter ? exercise.goals.includes(goalFilter as ExerciseGoal) : true;
      const matchesEquipment = equipmentFilter ? exercise.equipmentNeeded === equipmentFilter : true;
      const matchesPattern = patternFilter ? exercise.movementPattern === patternFilter : true;
      return matchesSearch && matchesMuscle && matchesGoal && matchesEquipment && matchesPattern;
    });
  }, [catalog, equipmentFilter, exerciseSearch, goalFilter, muscleFilter, patternFilter]);

  const unique = useMemo(() => {
    return {
      muscles: [...new Set(catalog.map((exercise) => exercise.primaryMuscleGroup))].sort(),
      equipment: [...new Set(catalog.map((exercise) => exercise.equipmentNeeded))].sort(),
      patterns: [...new Set(catalog.map((exercise) => exercise.movementPattern))].sort(),
    };
  }, [catalog]);

  const catalogById = useMemo(() => new Map(catalog.map((exercise) => [exercise.id, exercise])), [catalog]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [routineRow, session] = await Promise.all([
        apiFetch<Routine>(`/routines/${params.id}`),
        apiFetch<{ user: LocalUser }>('/auth/session'),
      ]);

      const [exercisesResult, linkResult] = await Promise.allSettled([
        apiFetch<Exercise[]>('/exercises'),
        apiFetch<PublicRoutineLink | null>(`/routines/${params.id}/public-link`),
      ]);

      setUser(session.user);
      setRoutine(routineRow);
      setPublicLink(linkResult.status === 'fulfilled' ? linkResult.value : null);
      setCatalog(exercisesResult.status === 'fulfilled' ? exercisesResult.value : []);
      setName(routineRow.name);
      setDescription(routineRow.description ?? '');
      setGoal(routineRow.goal ?? '');
      setDaysPerWeek(routineRow.daysPerWeek?.toString() ?? '');
      setStartDate(dateInput(routineRow.startDate));
      setEndDate(dateInput(routineRow.endDate));
      setDays(toDraftDays(routineRow.days));
      setActiveDayIndex(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar la rutina.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    if (activeDayIndex >= days.length) {
      setActiveDayIndex(Math.max(0, days.length - 1));
    }
  }, [activeDayIndex, days.length]);

  function addDay() {
    setActiveDayIndex(days.length);
    setDays((current) =>
      normalizeOrders([
        ...current,
        { name: `Dia ${current.length + 1}`, order: current.length + 1, exercises: [] },
      ]),
    );
  }

  function removeDay(index: number) {
    setDays((current) => normalizeOrders(current.filter((_, i) => i !== index)));
    setActiveDayIndex((current) => Math.max(0, Math.min(current, days.length - 2)));
  }

  function moveDay(index: number, direction: -1 | 1) {
    setDays((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return normalizeOrders(next);
    });
    setActiveDayIndex(index + direction);
  }

  function startDayDrag(event: React.DragEvent, dayIndex: number) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `day:${dayIndex}`);
  }

  function dropDay(event: React.DragEvent, targetIndex: number) {
    event.preventDefault();
    const [type, rawFrom] = event.dataTransfer.getData('text/plain').split(':');
    const fromIndex = Number(rawFrom);
    if (type !== 'day' || Number.isNaN(fromIndex) || fromIndex === targetIndex) return;
    setDays((current) => normalizeOrders(reorderList(current, fromIndex, targetIndex)));
    setActiveDayIndex(targetIndex);
  }

  function addExercise(dayIndex: number, exerciseId: string) {
    if (!exerciseId) return;
    setDays((current) =>
      normalizeOrders(
        current.map((day, index) =>
          index === dayIndex
            ? {
                ...day,
                exercises: [
                  ...day.exercises,
                  {
                    exerciseId,
                    order: day.exercises.length + 1,
                    sets: '',
                    repetitions: '',
                    restSeconds: '',
                    intensity: '',
                    tempo: '',
                    rir: '',
                    rpe: '',
                    observations: '',
                  },
                ],
              }
            : day,
        ),
      ),
    );
  }

  function updateExercise(dayIndex: number, exerciseIndex: number, next: Partial<ExerciseDraft>) {
    setDays((current) =>
      current.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((exercise, i) =>
                i === exerciseIndex ? { ...exercise, ...next } : exercise,
              ),
            }
          : day,
      ),
    );
  }

  function removeExercise(dayIndex: number, exerciseIndex: number) {
    setDays((current) =>
      normalizeOrders(
        current.map((day, index) =>
          index === dayIndex
            ? { ...day, exercises: day.exercises.filter((_, i) => i !== exerciseIndex) }
            : day,
        ),
      ),
    );
  }

  function moveExercise(dayIndex: number, exerciseIndex: number, direction: -1 | 1) {
    setDays((current) =>
      normalizeOrders(
        current.map((day, index) => {
          if (index !== dayIndex) return day;
          const target = exerciseIndex + direction;
          if (target < 0 || target >= day.exercises.length) return day;
          const exercises = [...day.exercises];
          [exercises[exerciseIndex], exercises[target]] = [exercises[target], exercises[exerciseIndex]];
          return { ...day, exercises };
        }),
      ),
    );
  }

  function startExerciseDrag(event: React.DragEvent, dayIndex: number, exerciseIndex: number) {
    if (isInteractiveDragTarget(event.target)) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `exercise:${dayIndex}:${exerciseIndex}`);
  }

  function dropExercise(event: React.DragEvent, targetDayIndex: number, targetExerciseIndex: number) {
    event.preventDefault();
    const [type, rawDay, rawFrom] = event.dataTransfer.getData('text/plain').split(':');
    const fromDayIndex = Number(rawDay);
    const fromExerciseIndex = Number(rawFrom);
    if (
      type !== 'exercise' ||
      Number.isNaN(fromDayIndex) ||
      Number.isNaN(fromExerciseIndex) ||
      fromDayIndex !== targetDayIndex ||
      fromExerciseIndex === targetExerciseIndex
    ) {
      return;
    }
    setDays((current) =>
      normalizeOrders(
        current.map((day, index) =>
          index === targetDayIndex
            ? { ...day, exercises: reorderList(day.exercises, fromExerciseIndex, targetExerciseIndex) }
            : day,
        ),
      ),
    );
  }

  function payloadDays() {
    return normalizeOrders(days).map((day) => ({
      name: day.name,
      order: day.order,
      exercises: day.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        order: exercise.order,
        sets: optionalNumber(exercise.sets),
        repetitions: optionalText(exercise.repetitions),
        restSeconds: optionalNumber(exercise.restSeconds),
        intensity: optionalText(exercise.intensity),
        tempo: optionalText(exercise.tempo),
        rir: optionalNumber(exercise.rir),
        rpe: optionalNumber(exercise.rpe),
        observations: optionalText(exercise.observations),
      })),
    }));
  }

  async function saveRoutineRequest() {
    return apiFetch<Routine>(`/routines/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          description: optionalText(description),
          goal: goal || undefined,
          daysPerWeek: optionalNumber(daysPerWeek),
          startDate: optionalText(startDate),
          endDate: optionalText(endDate),
          days: payloadDays(),
        }),
      });
  }

  async function saveRoutine() {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const updated = await saveRoutineRequest();
      setRoutine(updated);
      setDays(toDraftDays(updated.days));
      setNotice('Rutina guardada.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar la rutina.');
    } finally {
      setSaving(false);
    }
  }

  async function publishRoutine() {
    setSaving(true);
    setError('');
    setNotice('');
    const wasDraft = routine?.status === 'DRAFT';
    try {
      const updated = await saveRoutineRequest();
      setRoutine(updated);
      setDays(toDraftDays(updated.days));
      const published = await apiFetch<Routine>(`/routines/${params.id}/publish`, { method: 'PATCH' });
      setRoutine(published);
      setDays(toDraftDays(published.days));
      setNotice(wasDraft ? 'Rutina activada.' : 'Rutina actualizada.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo publicar la rutina.');
    } finally {
      setSaving(false);
    }
  }

  async function duplicateRoutine() {
    setSaving(true);
    setError('');
    try {
      const duplicated = await apiFetch<Routine>(`/routines/${params.id}/duplicate`, { method: 'POST' });
      router.push(`/routines/${duplicated.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo duplicar la rutina.');
    } finally {
      setSaving(false);
    }
  }

  async function archiveRoutine() {
    if (!window.confirm('Archivar esta rutina?')) return;
    setSaving(true);
    setError('');
    try {
      const archived = await apiFetch<Routine>(`/routines/${params.id}/archive`, { method: 'PATCH' });
      setRoutine(archived);
      setNotice('Rutina archivada.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo archivar la rutina.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteDraftRoutine() {
    if (!window.confirm('Eliminar este borrador de rutina?')) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/routines/${params.id}`, { method: 'DELETE' });
      router.push('/routines');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el borrador.');
      setSaving(false);
    }
  }

  function buildPublicUrl(token: string) {
    if (typeof window === 'undefined') return `/r/${token}`;
    return `${window.location.origin}/r/${token}`;
  }

  async function generatePublicLink() {
    setLinkBusy(true);
    setError('');
    setNotice('');
    try {
      const link = await apiFetch<PublicRoutineLink>(`/routines/${params.id}/public-link`, {
        method: 'POST',
      });
      setPublicLink(link);
      setNotice('Enlace público generado.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo generar el enlace público.');
    } finally {
      setLinkBusy(false);
    }
  }

  async function revokePublicLink() {
    if (!window.confirm('Revocar este enlace público?')) return;
    setLinkBusy(true);
    setError('');
    setNotice('');
    try {
      const link = await apiFetch<PublicRoutineLink | null>(`/routines/${params.id}/public-link/revoke`, {
        method: 'PATCH',
      });
      setPublicLink(link);
      setNotice('Enlace público revocado.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo revocar el enlace público.');
    } finally {
      setLinkBusy(false);
    }
  }

  async function copyPublicLink() {
    if (!publicLink) return;
    await navigator.clipboard.writeText(buildPublicUrl(publicLink.token));
    setNotice('Link copiado.');
  }

  async function sendPublicLinkEmail() {
    if (!routine) return;

    const manualEmail = routine.student.email
      ? undefined
      : window.prompt('Email del alumno')?.trim();

    if (manualEmail === null) {
      return;
    }

    setEmailBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await apiFetch<{
        sent: boolean;
        email: string;
        publicLink: PublicRoutineLink;
      }>(`/routines/${params.id}/public-link/email`, {
        method: 'POST',
        body: JSON.stringify({
          ...(manualEmail ? { email: manualEmail } : {}),
        }),
      });
      setPublicLink(result.publicLink);
      setNotice(`Email enviado a ${result.email}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo enviar el email.');
    } finally {
      setEmailBusy(false);
    }
  }

  if (loading) {
    return <p className="rounded-[8px] border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#64748b]">Cargando...</p>;
  }

  if (error && !routine) {
    return (
      <div className="space-y-4">
        <Link className="text-sm font-black text-[#087a3d]" href="/routines">Volver a rutinas</Link>
        <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p>
      </div>
    );
  }

  if (!routine) return null;
  const canMutate = user?.role === 'TRAINER' && !isArchived;

  return (
    <div className="space-y-7">
      <nav className="text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/routines">Rutinas</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[#1e293b]">{routine.name}</span>
      </nav>

      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-[#0f172a]">{routine.name}</h1>
            <span className="rounded-full bg-[#eaf6ef] px-3 py-1 text-xs font-black text-[#087a3d]">
              {statusLabels[routine.status]}
            </span>
          </div>
          <p className="mt-2 text-base text-[#6b7280]">
            {routine.student.firstName} {routine.student.lastName}
          </p>
        </div>
        {user?.role === 'TRAINER' ? (
          <div className="flex flex-wrap gap-3">
            <button className="h-11 rounded-[8px] border border-[#d8dee6] px-4 text-sm font-black text-[#334155] transition hover:bg-[#f8faf9] disabled:opacity-60" disabled={saving} onClick={duplicateRoutine} type="button">
              Duplicar
            </button>
            {canMutate ? (
            <>
              {routine.status === 'DRAFT' ? (
                <button className="h-11 rounded-[8px] border border-[#f3c5c1] px-4 text-sm font-black text-[#b3261e] transition hover:bg-[#fff7f7] disabled:opacity-60" disabled={saving} onClick={deleteDraftRoutine} type="button">
                  Eliminar borrador
                </button>
              ) : null}
              {routine.status === 'ACTIVE' ? (
                <button className="h-11 rounded-[8px] border border-[#d8dee6] px-4 text-sm font-black text-[#334155] transition hover:bg-[#f8faf9] disabled:opacity-60" disabled={saving} onClick={archiveRoutine} type="button">
                  Archivar rutina
                </button>
              ) : null}
              <button className="h-11 rounded-[8px] bg-[#087a3d] px-5 text-sm font-black text-white transition hover:bg-[#076b36] disabled:opacity-60" disabled={saving} onClick={saveRoutine} type="button">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button className="h-11 rounded-[8px] bg-[#0f172a] px-5 text-sm font-black text-white transition hover:bg-[#1e293b] disabled:opacity-60" disabled={saving} onClick={publishRoutine} type="button">
                {routine.status === 'DRAFT' ? 'Activar' : 'Actualizar'}
              </button>
            </>
            ) : null}
          </div>
        ) : null}
      </header>

      {error ? <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p> : null}
      {notice ? <p className="rounded-[8px] border border-[#b8dec7] bg-white px-4 py-3 text-sm text-[#087a3d]">{notice}</p> : null}

      {routine.status === 'ACTIVE' ? (
        <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 border-b border-[#edf1ee] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-black text-[#0f172a]">Enlace publico</h2>
              <p className="mt-1 text-xs text-[#64748b]">Link compartible de la rutina activa.</p>
            </div>
            {!publicLink && user?.role === 'TRAINER' ? (
              <div className="flex flex-wrap gap-2">
                <button className="h-9 rounded-[8px] bg-[#087a3d] px-3 text-xs font-black text-white transition hover:bg-[#076b36] disabled:opacity-60" disabled={linkBusy || emailBusy} onClick={generatePublicLink} type="button">
                  {linkBusy ? 'Generando...' : 'Generar enlace'}
                </button>
                <button className="h-9 rounded-[8px] border border-[#087a3d] px-3 text-xs font-black text-[#087a3d] transition hover:bg-[#f4fbf6] disabled:opacity-60" disabled={linkBusy || emailBusy} onClick={sendPublicLinkEmail} type="button">
                  {emailBusy ? 'Enviando...' : 'Enviar mail'}
                </button>
              </div>
            ) : null}
          </div>
          <div className="px-4 py-3">
            {publicLink ? (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <input
                  className="h-9 min-w-0 flex-1 rounded-[8px] border border-[#d8dee6] bg-[#f8faf9] px-3 text-sm text-[#334155]"
                  readOnly
                  value={buildPublicUrl(publicLink.token)}
                />
                {user?.role === 'TRAINER' && publicLink.status === 'ACTIVE' ? (
                  <div className="flex flex-wrap gap-2">
                    <button className="h-9 rounded-[8px] border border-[#d8dee6] px-3 text-xs font-black text-[#334155] transition hover:bg-[#f8faf9]" disabled={linkBusy} onClick={copyPublicLink} type="button">
                      Copiar link
                    </button>
                    <button className="h-9 rounded-[8px] border border-[#087a3d] px-3 text-xs font-black text-[#087a3d] transition hover:bg-[#f4fbf6]" disabled={linkBusy || emailBusy} onClick={sendPublicLinkEmail} type="button">
                      {emailBusy ? 'Enviando...' : 'Enviar mail'}
                    </button>
                    <button className="h-9 rounded-[8px] border border-[#f3c5c1] px-3 text-xs font-black text-[#b3261e] transition hover:bg-[#fff7f7]" disabled={linkBusy} onClick={revokePublicLink} type="button">
                      Revocar
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-[#64748b]">Todavia no hay enlace publico para esta rutina.</p>
            )}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#edf1ee] px-4 py-3">
          <h2 className="text-base font-black text-[#0f172a]">Informacion general</h2>
        </div>
        <div className="grid gap-3 px-4 py-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Nombre">
            <input className="mt-1 h-9 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]" disabled={!canMutate} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Objetivo">
            <select className="mt-1 h-9 w-full rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]" disabled={!canMutate} value={goal} onChange={(event) => setGoal(event.target.value as ExerciseGoal | '')}>
              <option value="">Seleccionar objetivo</option>
              {Object.entries(goalLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Dias por semana">
            <input className="mt-1 h-9 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]" disabled={!canMutate} max={7} min={1} type="number" value={daysPerWeek} onChange={(event) => setDaysPerWeek(event.target.value)} />
          </Field>
          <Field label="Fecha inicio">
            <input className="mt-1 h-9 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]" disabled={!canMutate} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </Field>
          <Field label="Fecha fin">
            <input className="mt-1 h-9 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]" disabled={!canMutate} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </Field>
          <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
            Descripcion
            <textarea className="mt-1 min-h-14 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]" disabled={!canMutate} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          {trainingDayTotal !== null ? (
            <div className="rounded-[8px] border border-[#d8eee0] bg-[#f4fbf6] px-4 py-3 text-sm text-[#14532d] sm:col-span-2 xl:col-span-4">
              Total estimado: <strong>{trainingDayTotal}</strong> dias de entrenamiento en el plazo seleccionado.
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[8px] border border-[#dde5df] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#0f172a]">Selector de ejercicios</h2>
            <p className="mt-1 text-sm text-[#64748b]">Solo muestra ejercicios aprobados y activos del catalogo.</p>
          </div>
          {canMutate && !days.length ? (
            <button className="h-10 rounded-[8px] bg-[#eaf6ef] px-4 text-sm font-black text-[#087a3d] transition hover:bg-[#dcf3e4]" onClick={addDay} type="button">
              Agregar dia
            </button>
          ) : null}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <input className="h-10 rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]" placeholder="Buscar ejercicio" value={exerciseSearch} onChange={(event) => setExerciseSearch(event.target.value)} />
          <select className="h-10 rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm" value={muscleFilter} onChange={(event) => setMuscleFilter(event.target.value)}>
            <option value="">Grupo</option>
            {unique.muscles.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="h-10 rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm" value={goalFilter} onChange={(event) => setGoalFilter(event.target.value)}>
            <option value="">Objetivo</option>
            {Object.entries(goalLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="h-10 rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm" value={equipmentFilter} onChange={(event) => setEquipmentFilter(event.target.value)}>
            <option value="">Equipo</option>
            {unique.equipment.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="h-10 rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm" value={patternFilter} onChange={(event) => setPatternFilter(event.target.value)}>
            <option value="">Patron</option>
            {unique.patterns.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </section>

      <section className="space-y-3">
        {days.length ? (
          <div className="flex flex-wrap gap-2 rounded-[8px] border border-[#dde5df] bg-white p-3">
            {days.map((day, index) => (
              <button
                className={`h-9 rounded-[8px] px-3 text-xs font-black transition ${
                  index === activeDayIndex
                    ? 'bg-[#087a3d] text-white'
                    : 'border border-[#d8dee6] text-[#334155] hover:bg-[#f8faf9]'
                }`}
                draggable={canMutate}
                key={`${day.order}-${index}`}
                onClick={() => setActiveDayIndex(index)}
                onDragOver={(event) => canMutate && event.preventDefault()}
                onDragStart={(event) => startDayDrag(event, index)}
                onDrop={(event) => canMutate && dropDay(event, index)}
                title={canMutate ? 'Arrastrar para reordenar dias' : undefined}
                type="button"
              >
                {day.name} · {day.exercises.length} ej.
              </button>
            ))}
            {canMutate ? (
              <button className="h-9 rounded-[8px] bg-[#eaf6ef] px-3 text-xs font-black text-[#087a3d]" onClick={addDay} type="button">
                + Dia
              </button>
            ) : null}
          </div>
        ) : null}

        {days.map((day, dayIndex) => (
          dayIndex !== activeDayIndex ? null : (
          <article className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]" key={`${day.order}-${dayIndex}`}>
            <div className="flex flex-col gap-3 border-b border-[#edf1ee] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-xs font-black text-[#087a3d]">{day.order}</span>
                <p className="text-sm font-black text-[#0f172a]">{day.name}</p>
              </div>
              {canMutate ? (
                <div className="flex flex-wrap gap-2">
                  <button className="h-8 rounded-[8px] border border-[#d8dee6] px-2.5 text-xs font-black text-[#334155]" onClick={() => moveDay(dayIndex, -1)} type="button">Subir</button>
                  <button className="h-8 rounded-[8px] border border-[#d8dee6] px-2.5 text-xs font-black text-[#334155]" onClick={() => moveDay(dayIndex, 1)} type="button">Bajar</button>
                  <button className="h-8 rounded-[8px] border border-[#f3c5c1] px-2.5 text-xs font-black text-[#b3261e]" onClick={() => removeDay(dayIndex)} type="button">Eliminar</button>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 px-4 py-3">
              {canMutate ? (
                <div className="flex flex-col gap-2 rounded-[8px] border border-[#e8eee9] bg-[#f8faf9] p-3 md:flex-row md:items-center">
                  <select className="h-9 min-w-0 flex-1 rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm" defaultValue="" onChange={(event) => { addExercise(dayIndex, event.target.value); event.currentTarget.value = ''; }}>
                    <option value="">Agregar ejercicio desde catalogo...</option>
                    {catalogOptions.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name} · {exercise.primaryMuscleGroup} · {exercise.equipmentNeeded}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-[#64748b]">{catalogOptions.length} disponibles</span>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {day.exercises.map((item, exerciseIndex) => {
                const exercise = catalogById.get(item.exerciseId);
                return (
                  <div
                    className="cursor-grab rounded-[8px] border border-[#e5e7eb] p-3 active:cursor-grabbing"
                    draggable={canMutate}
                    key={`${item.exerciseId}-${exerciseIndex}`}
                    onDragOver={(event) => canMutate && event.preventDefault()}
                    onDragStart={(event) => startExerciseDrag(event, dayIndex, exerciseIndex)}
                    onDrop={(event) => canMutate && dropExercise(event, dayIndex, exerciseIndex)}
                    title={canMutate ? 'Arrastrar para reordenar ejercicios' : undefined}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#0f172a]">{item.order}. {exercise?.name ?? 'Ejercicio no disponible'}</p>
                        <p className="mt-1 text-xs text-[#64748b]">{exercise ? `${exercise.primaryMuscleGroup} · ${exercise.movementPattern} · ${exercise.equipmentNeeded}` : item.exerciseId}</p>
                      </div>
                      {canMutate ? (
                        <div className="flex flex-wrap gap-2">
                          <button className="h-7 rounded-[8px] border border-[#d8dee6] px-2.5 text-xs font-black text-[#334155]" onClick={() => moveExercise(dayIndex, exerciseIndex, -1)} type="button">Subir</button>
                          <button className="h-7 rounded-[8px] border border-[#d8dee6] px-2.5 text-xs font-black text-[#334155]" onClick={() => moveExercise(dayIndex, exerciseIndex, 1)} type="button">Bajar</button>
                          <button className="h-7 rounded-[8px] border border-[#f3c5c1] px-2.5 text-xs font-black text-[#b3261e]" onClick={() => removeExercise(dayIndex, exerciseIndex)} type="button">Eliminar</button>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {executionFields.map(({ label, field, type = 'text', min, max, placeholder }) => (
                        <label className="text-xs font-black text-[#64748b]" key={field}>
                          {label}
                          <input
                            className="mt-1 h-8 w-full rounded-[8px] border border-[#d8dee6] px-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]"
                            disabled={!canMutate}
                            max={max}
                            min={min}
                            placeholder={placeholder}
                            type={type}
                            value={String(item[field] ?? '')}
                            onChange={(event) => updateExercise(dayIndex, exerciseIndex, { [field]: event.target.value })}
                          />
                        </label>
                      ))}
                    </div>
                    <label className="mt-3 block text-xs font-black text-[#64748b]">
                      Observaciones
                      <textarea className="mt-1 min-h-12 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm font-normal text-[#0f172a] outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]" disabled={!canMutate} value={item.observations} onChange={(event) => updateExercise(dayIndex, exerciseIndex, { observations: event.target.value })} />
                    </label>
                  </div>
                );
              })}
              </div>
              {!day.exercises.length ? <p className="rounded-[8px] bg-[#f8faf9] px-4 py-5 text-center text-sm text-[#64748b]">Este dia todavia no tiene ejercicios.</p> : null}
            </div>
          </article>
          )
        ))}
        {!days.length ? (
          <div className="rounded-[8px] border border-[#dde5df] bg-white px-6 py-10 text-center text-sm text-[#64748b]">
            Todavia no hay dias cargados.
          </div>
        ) : null}
      </section>

    </div>
  );
}
