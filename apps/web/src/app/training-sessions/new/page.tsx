'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, LocalUser, Routine, Student, TrainingSession } from '@/lib/api';

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export default function NewTrainingSessionPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [studentId, setStudentId] = useState('');
  const [routineId, setRoutineId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [saving, setSaving] = useState(false);

  const studentOptions = useMemo(
    () =>
      students
        .map((student) => ({
          value: student.id,
          label: `${student.firstName} ${student.lastName}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [students],
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
        const rows = await apiFetch<Student[]>('/students');
        setStudents(rows);
        setStudentId(initialStudentId);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los alumnos.');
      } finally {
        setLoading(false);
      }
    }

    void loadStudents();
  }, []);

  useEffect(() => {
    async function loadRoutines() {
      if (!studentId) {
        setRoutines([]);
        setRoutineId('');
        return;
      }

      setLoadingRoutines(true);
      try {
        const rows = await apiFetch<Routine[]>(`/routines?studentId=${studentId}&status=ACTIVE`);
        setRoutines(rows);
        setRoutineId(rows[0]?.id ?? '');
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudieron cargar las rutinas.');
      } finally {
        setLoadingRoutines(false);
      }
    }

    void loadRoutines();
  }, [studentId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const session = await apiFetch<TrainingSession>('/training-sessions', {
        method: 'POST',
        body: JSON.stringify({
          routineId,
          scheduledDate: optionalText(scheduledDate),
          notes: optionalText(notes),
        }),
      });
      router.push(`/training-sessions/${session.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo crear la sesión.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <nav className="text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/training-sessions">Entrenamientos</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[#1e293b]">Nueva sesión</span>
      </nav>

      <header>
        <h1 className="text-3xl font-black text-[#0f172a]">Crear sesión de entrenamiento</h1>
        <p className="mt-2 text-base text-[#6b7280]">
          Se copia la estructura publicada de la rutina (días, ejercicios y parámetros) para registrar la ejecución real.
        </p>
      </header>

      {error ? <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p> : null}
      {loading ? <p className="rounded-[8px] border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#64748b]">Cargando...</p> : null}

      {!loading && user?.role !== 'TRAINER' ? (
        <section className="max-w-3xl rounded-[8px] border border-[#dde5df] bg-white px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-black text-[#0f172a]">Solo lectura para administradores</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Los administradores pueden visualizar entrenamientos, pero la creación queda reservada a entrenadores.
          </p>
          <Link className="mt-5 inline-flex rounded-[8px] bg-[#087a3d] px-5 py-3 text-sm font-black text-white" href="/training-sessions">
            Volver a entrenamientos
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
                  onChange={(event) => setStudentId(event.target.value)}
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
                Rutina activa *
                <select
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm outline-none focus:border-[#087a3d] disabled:bg-[#f8faf9]"
                  disabled={!studentId || loadingRoutines}
                  required
                  value={routineId}
                  onChange={(event) => setRoutineId(event.target.value)}
                >
                  <option value="">
                    {loadingRoutines ? 'Cargando rutinas...' : 'Seleccionar rutina'}
                  </option>
                  {routines.map((routine) => (
                    <option key={routine.id} value={routine.id}>
                      {routine.name} · version {routine.version}
                    </option>
                  ))}
                </select>
                {studentId && !loadingRoutines && !routines.length ? (
                  <span className="mt-2 block text-xs font-normal text-[#b3261e]">
                    Este alumno no tiene rutinas activas publicadas.
                  </span>
                ) : null}
              </label>
              <label className="text-sm font-semibold text-[#334155]">
                Fecha programada
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
                  type="date"
                  value={scheduledDate}
                  onChange={(event) => setScheduledDate(event.target.value)}
                />
              </label>
              <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
                Notas
                <textarea
                  className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-[8px] bg-[#087a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#076b36] disabled:opacity-60"
              disabled={saving || !routineId}
              type="submit"
            >
              {saving ? 'Creando...' : 'Crear sesión'}
            </button>
            <Link className="rounded-[8px] border border-[#d8dee6] px-6 py-3 text-sm font-semibold text-[#334155] transition hover:bg-[#f8faf9]" href="/training-sessions">
              Cancelar
            </Link>
          </div>
        </form>
      ) : null}
    </div>
  );
}
