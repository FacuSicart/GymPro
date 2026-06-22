'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, ExerciseGoal, LocalUser, Routine, RoutineTemplate, Student } from '@/lib/api';

const goalOptions: Array<{ value: ExerciseGoal; label: string }> = [
  { value: 'STRENGTH', label: 'Fuerza' },
  { value: 'MOBILITY', label: 'Movilidad' },
  { value: 'ENDURANCE', label: 'Cardio' },
  { value: 'POWER', label: 'Potencia' },
  { value: 'CORE', label: 'Core' },
];

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalPositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function calculateTrainingDayTotal(startDate: string, endDate: string, daysPerWeek: string) {
  const weeklyDays = optionalPositiveNumber(daysPerWeek);
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

function emptyTrainingDay(order: number) {
  return {
    name: `Dia ${order}`,
    order,
    exercises: [],
  };
}

function routineDaysPayload(template: RoutineTemplate | undefined, targetTotal: number | null) {
  const templateDays =
    template?.days.map((day) => ({
      name: day.name,
      order: day.order,
      exercises: day.exercises.map((item) => ({
        exerciseId: item.exerciseId,
        order: item.order,
        sets: item.sets ?? undefined,
        repetitions: item.repetitions ?? undefined,
        restSeconds: item.restSeconds ?? undefined,
        intensity: item.intensity ?? undefined,
        tempo: item.tempo ?? undefined,
        rir: item.rir ?? undefined,
        rpe: item.rpe ?? undefined,
        observations: item.observations ?? undefined,
      })),
    })) ?? [];

  if (!targetTotal) {
    return templateDays;
  }

  return Array.from({ length: targetTotal }, (_, index) => {
    const templateDay = templateDays[index];
    return templateDay ? { ...templateDay, order: index + 1 } : emptyTrainingDay(index + 1);
  });
}

export default function NewRoutinePage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [studentId, setStudentId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [exercisesPerDay, setExercisesPerDay] = useState('6');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<ExerciseGoal | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);

  const studentOptions = useMemo(
    () =>
      students
        .map((student) => ({
          value: student.id,
          label: `${student.firstName} ${student.lastName}`,
          goal: student.profile?.goal ?? '',
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [students],
  );

  const compatibleTemplates = useMemo(
    () =>
      templates
        .filter((template) => template.status === 'ACTIVE')
        .filter((template) => (goal ? template.goal === goal : true))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [goal, templates],
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId),
    [templateId, templates],
  );
  const trainingDayTotal = useMemo(
    () => calculateTrainingDayTotal(startDate, endDate, daysPerWeek),
    [daysPerWeek, endDate, startDate],
  );

  useEffect(() => {
    async function loadStudents() {
      try {
        const session = await apiFetch<{ user: LocalUser }>('/auth/session');
        setUser(session.user);
        if (session.user.role !== 'TRAINER') {
          return;
        }
        const initialStudentId =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('studentId') ?? ''
            : '';
        const [rows, templateRows] = await Promise.all([
          apiFetch<Student[]>('/students'),
          apiFetch<RoutineTemplate[]>('/routine-templates?status=ACTIVE'),
        ]);
        setStudents(rows);
        setTemplates(templateRows);
        setStudentId(initialStudentId);
        const selected = rows.find((student) => student.id === initialStudentId);
        if (selected?.profile?.goal) {
          setGoal(selected.profile.goal);
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los alumnos.');
      } finally {
        setLoading(false);
      }
    }

    void loadStudents();
  }, []);

  useEffect(() => {
    if (!templateId || !goal) return;
    if (selectedTemplate?.goal !== goal) {
      setTemplateId('');
    }
  }, [goal, selectedTemplate?.goal, templateId]);

  function onStudentChange(value: string) {
    setStudentId(value);
    const selected = students.find((student) => student.id === value);
    if (selected?.profile?.goal) {
      setGoal(selected.profile.goal);
    }
  }

  function onTemplateChange(value: string) {
    setTemplateId(value);
    const template = templates.find((item) => item.id === value);
    if (!template) {
      return;
    }

    setName((current) => current || template.name);
    setDescription((current) => current || template.description || '');
    if (template.daysPerWeek) {
      setDaysPerWeek(String(template.daysPerWeek));
    }
    if (template.goal) {
      setGoal(template.goal);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const routine = await apiFetch<Routine>('/routines', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          name,
          description: optionalText(description),
          goal: goal || undefined,
          daysPerWeek: optionalPositiveNumber(daysPerWeek),
          startDate: optionalText(startDate),
          endDate: optionalText(endDate),
          days: routineDaysPayload(selectedTemplate, trainingDayTotal),
        }),
      });
      router.push(`/routines/${routine.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo crear la rutina.');
    } finally {
      setSaving(false);
    }
  }

  async function onGenerateWithAi() {
    setError('');
    setAiSaving(true);

    try {
      const routine = await apiFetch<Routine>('/routines/ai-draft', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          name: optionalText(name),
          goal: goal || undefined,
          startDate: optionalText(startDate),
          endDate: optionalText(endDate),
          daysPerWeek: optionalPositiveNumber(daysPerWeek),
          exercisesPerDay: optionalPositiveNumber(exercisesPerDay),
        }),
      });
      router.push(`/routines/${routine.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo generar la rutina con IA.');
    } finally {
      setAiSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <nav className="text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/routines">Rutinas</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[#1e293b]">Nueva rutina</span>
      </nav>

      <header>
        <h1 className="text-3xl font-black text-[#0f172a]">Crear rutina</h1>
        <p className="mt-2 text-base text-[#6b7280]">
          Crea una rutina especifica para un alumno desde cero o tomando una plantilla como base.
        </p>
      </header>

      {error ? <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p> : null}
      {loading ? <p className="rounded-[8px] border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#64748b]">Cargando...</p> : null}

      {!loading && user?.role !== 'TRAINER' ? (
        <section className="max-w-3xl rounded-[8px] border border-[#dde5df] bg-white px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-black text-[#0f172a]">Solo lectura para administradores</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Los administradores pueden visualizar rutinas, pero la creacion queda reservada a entrenadores.
          </p>
          <Link className="mt-5 inline-flex rounded-[8px] bg-[#087a3d] px-5 py-3 text-sm font-black text-white" href="/routines">
            Volver a rutinas
          </Link>
        </section>
      ) : null}

      {!loading && user?.role === 'TRAINER' ? (
        <form className="max-w-4xl space-y-6" onSubmit={onSubmit}>
          <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[#edf1ee] px-6 py-5">
              <h2 className="text-lg font-black text-[#0f172a]">Datos generales</h2>
            </div>
            <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-[#334155]">
                Alumno *
                <select
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm outline-none focus:border-[#087a3d]"
                  required
                  value={studentId}
                  onChange={(event) => onStudentChange(event.target.value)}
                >
                  <option value="">Seleccionar alumno</option>
                  {studentOptions.map((student) => (
                    <option key={student.value} value={student.value}>
                      {student.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-[#334155]">
                Objetivo
                <select
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm outline-none focus:border-[#087a3d]"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value as ExerciseGoal | '')}
                >
                  <option value="">Seleccionar objetivo</option>
                  {goalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-[#334155]">
                Plantilla
                <select
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm outline-none focus:border-[#087a3d]"
                  value={templateId}
                  onChange={(event) => onTemplateChange(event.target.value)}
                >
                  <option value="">Crear rutina vacia</option>
                  {compatibleTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.days.length} dias -{' '}
                      {template.days.reduce((sum, day) => sum + day.exercises.length, 0)} ejercicios
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-[#334155]">
                Dias por semana *
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
                  max={7}
                  min={1}
                  required
                  type="number"
                  value={daysPerWeek}
                  onChange={(event) => setDaysPerWeek(event.target.value)}
                />
              </label>
              <label className="text-sm font-semibold text-[#334155]">
                Ejercicios por dia para IA *
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
                  max={12}
                  min={1}
                  type="number"
                  value={exercisesPerDay}
                  onChange={(event) => setExercisesPerDay(event.target.value)}
                />
              </label>
              {trainingDayTotal !== null ? (
                <div className="rounded-[8px] border border-[#d8eee0] bg-[#f4fbf6] px-4 py-3 text-sm text-[#14532d] sm:col-span-2">
                  Se van a crear <strong>{trainingDayTotal}</strong> dias de entrenamiento para el plazo seleccionado.
                </div>
              ) : null}
              <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
                Nombre *
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="ej. Rutina fuerza 3 dias"
                />
              </label>
              <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
                Descripcion
                <textarea
                  className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <label className="text-sm font-semibold text-[#334155]">
                Fecha inicio
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className="text-sm font-semibold text-[#334155]">
                Fecha fin
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-[8px] bg-[#087a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#076b36] disabled:opacity-60" disabled={saving || aiSaving} type="submit">
              {saving ? 'Creando...' : 'Crear borrador'}
            </button>
            <button
              className="rounded-[8px] border border-[#087a3d] px-6 py-3 text-sm font-semibold text-[#087a3d] transition hover:bg-[#f4fbf6] disabled:opacity-60"
              disabled={saving || aiSaving}
              type="button"
              onClick={onGenerateWithAi}
            >
              {aiSaving ? 'Generando...' : 'Generar rutina con IA'}
            </button>
            <Link className="rounded-[8px] border border-[#d8dee6] px-6 py-3 text-sm font-semibold text-[#334155] transition hover:bg-[#f8faf9]" href="/routines">
              Cancelar
            </Link>
          </div>
        </form>
      ) : null}
    </div>
  );
}
