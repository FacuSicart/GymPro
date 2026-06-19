'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, LocalUser, Student, TrainingSession, TrainingSessionStatus } from '@/lib/api';

const statusLabels: Record<TrainingSessionStatus, string> = {
  PLANNED: 'Planificada',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const statusTone: Record<TrainingSessionStatus, string> = {
  PLANNED: 'bg-[#fff7ed] text-[#c2410c]',
  IN_PROGRESS: 'bg-[#eff6ff] text-[#1d4ed8]',
  COMPLETED: 'bg-[#e7f6ee] text-[#087a3d]',
  CANCELLED: 'bg-[#f1f5f9] text-[#475569]',
};

function buildQuery(filters: { studentId: string; status: string }) {
  const params = new URLSearchParams();
  if (filters.studentId) params.set('studentId', filters.studentId);
  if (filters.status) params.set('status', filters.status);
  const query = params.toString();
  return query ? `?${query}` : '';
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function TrainingSessionsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [filters, setFilters] = useState({ studentId: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  async function load(nextFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const [sessionRows, studentRows] = await Promise.all([
        apiFetch<TrainingSession[]>(`/training-sessions${buildQuery(nextFilters)}`),
        apiFetch<Student[]>('/students'),
      ]);
      setSessions(sessionRows);
      setStudents(studentRows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los entrenamientos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitial() {
      try {
        const session = await apiFetch<{ user: LocalUser }>('/auth/session');
        setUser(session.user);
      } finally {
        await load();
      }
    }

    void loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applyFilters() {
    await load(filters);
  }

  async function clearFilters() {
    const empty = { studentId: '', status: '' };
    setFilters(empty);
    await load(empty);
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a]">Entrenamientos</h1>
          <p className="mt-2 text-base text-[#6b7280]">
            Sesiones de entrenamiento registradas a partir de rutinas publicadas.
          </p>
        </div>
        {user?.role === 'TRAINER' ? (
          <Link
            className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#0aa34a] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(8,122,61,0.18)] transition hover:bg-[#087a3d]"
            href="/training-sessions/new"
          >
            Nueva sesión
          </Link>
        ) : null}
      </header>

      <section className="rounded-[14px] border border-[#dfe5e1] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <div className="grid gap-5 md:grid-cols-3">
          <label className="text-sm font-black text-[#17202a]">
            Alumno
            <select
              className="mt-2 h-11 w-full rounded-[8px] border border-[#dfe5e1] bg-white px-3 text-sm font-normal outline-none focus:border-[#087a3d]"
              value={filters.studentId}
              onChange={(event) => setFilters((current) => ({ ...current, studentId: event.target.value }))}
            >
              <option value="">Todos los alumnos</option>
              {studentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-black text-[#17202a]">
            Estado
            <select
              className="mt-2 h-11 w-full rounded-[8px] border border-[#dfe5e1] bg-white px-3 text-sm font-normal outline-none focus:border-[#087a3d]"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="">Todos los estados</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-3">
            <button className="h-11 rounded-[8px] bg-[#0aa34a] px-5 text-sm font-semibold text-white transition hover:bg-[#087a3d]" onClick={applyFilters} type="button">
              Filtrar
            </button>
            <button className="h-11 rounded-[8px] border border-[#dfe5e1] px-5 text-sm font-semibold text-[#334155] transition hover:bg-[#f8faf9]" onClick={clearFilters} type="button">
              Limpiar
            </button>
          </div>
        </div>
      </section>

      {error ? <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p> : null}
      {loading ? <p className="rounded-[8px] border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#64748b]">Cargando...</p> : null}

      {!loading ? (
        <section className="overflow-hidden rounded-[14px] border border-[#dfe5e1] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead className="text-[#7c8783]">
                <tr className="border-b border-[#e8eee9]">
                  <th className="px-6 py-4 font-black">Sesión</th>
                  <th className="px-6 py-4 font-black">Alumno</th>
                  <th className="px-6 py-4 font-black">Rutina</th>
                  <th className="px-6 py-4 font-black">Estado</th>
                  <th className="px-6 py-4 font-black">Fecha</th>
                  <th className="px-6 py-4 font-black">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr className="border-b border-[#edf1ee] last:border-b-0" key={session.id}>
                    <td className="px-6 py-4">
                      <p className="font-black text-[#0f172a]">{session.routine.name}</p>
                      <p className="mt-1 text-sm text-[#7c8783]">
                        {session.days.length} dias · version {session.routineVersion}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[#1f2937]">
                      {session.student.firstName} {session.student.lastName}
                    </td>
                    <td className="px-6 py-4 text-[#1f2937]">{session.routine.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-black ${statusTone[session.status]}`}>
                        {statusLabels[session.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#1f2937]">{formatDate(session.scheduledDate)}</td>
                    <td className="px-6 py-4">
                      <Link className="font-black text-[#087a3d] hover:text-[#065f34]" href={`/training-sessions/${session.id}`}>
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
                {!sessions.length ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-[#64748b]" colSpan={6}>
                      No hay entrenamientos para esta vista.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
