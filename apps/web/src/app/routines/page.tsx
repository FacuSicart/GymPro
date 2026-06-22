'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, LocalUser, Routine, RoutineStatus, Student } from '@/lib/api';

const statusLabels: Record<RoutineStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  ARCHIVED: 'Archivada',
};

const statusTone: Record<RoutineStatus, string> = {
  DRAFT: 'bg-[#fff7ed] text-[#c2410c]',
  ACTIVE: 'bg-[#e7f6ee] text-[#087a3d]',
  ARCHIVED: 'bg-[#f1f5f9] text-[#475569]',
};

const goalLabels: Record<string, string> = {
  STRENGTH: 'Fuerza',
  MOBILITY: 'Movilidad',
  ENDURANCE: 'Cardio',
  POWER: 'Potencia',
  CORE: 'Core',
};

function buildQuery(filters: { studentId: string; status: string }) {
  const params = new URLSearchParams();
  if (filters.studentId) params.set('studentId', filters.studentId);
  if (filters.status) params.set('status', filters.status);
  const query = params.toString();
  return query ? `?${query}` : '';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [filters, setFilters] = useState({ studentId: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
      const [routineRows, studentRows] = await Promise.all([
        apiFetch<Routine[]>(`/routines${buildQuery(nextFilters)}`),
        apiFetch<Student[]>('/students'),
      ]);
      setRoutines(routineRows);
      setStudents(studentRows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudieron cargar las rutinas.');
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
    setPage(1);
    await load(filters);
  }

  async function clearFilters() {
    const empty = { studentId: '', status: '' };
    setFilters(empty);
    setPage(1);
    await load(empty);
  }

  const totalPages = Math.max(1, Math.ceil(routines.length / pageSize));
  const paginatedRoutines = routines.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a]">Rutinas</h1>
          <p className="mt-2 text-base text-[#6b7280]">
            Planes de entrenamiento por alumno, organizados por dias y ejercicios del catalogo.
          </p>
        </div>
        {user?.role === 'TRAINER' ? (
          <Link
            className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#0aa34a] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(8,122,61,0.18)] transition hover:bg-[#087a3d]"
            href="/routines/new"
          >
            Nueva rutina
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
                  <th className="px-6 py-4 font-black">Rutina</th>
                  <th className="px-6 py-4 font-black">Alumno</th>
                  <th className="px-6 py-4 font-black">Objetivo</th>
                  <th className="px-6 py-4 font-black">Estado</th>
                  <th className="px-6 py-4 font-black">Actualizada</th>
                  <th className="px-6 py-4 font-black">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoutines.map((routine) => (
                  <tr className="border-b border-[#edf1ee] last:border-b-0" key={routine.id}>
                    <td className="px-6 py-4">
                      <p className="font-black text-[#0f172a]">{routine.name}</p>
                      <p className="mt-1 text-sm text-[#7c8783]">
                        {routine.days.length} dias · version {routine.version}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[#1f2937]">
                      {routine.student.firstName} {routine.student.lastName}
                    </td>
                    <td className="px-6 py-4 text-[#1f2937]">
                      {routine.goal ? goalLabels[routine.goal] : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-black ${statusTone[routine.status]}`}>
                        {statusLabels[routine.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#1f2937]">{formatDate(routine.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <Link className="font-black text-[#087a3d] hover:text-[#065f34]" href={`/routines/${routine.id}`}>
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
                {!paginatedRoutines.length ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-[#64748b]" colSpan={6}>
                      No hay rutinas para esta vista.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-[#edf1ee] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#64748b]">
              Mostrando {routines.length ? (page - 1) * pageSize + 1 : 0}-
              {Math.min(page * pageSize, routines.length)} de {routines.length}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#64748b]">Filas por pagina</span>
              <span className="rounded-[8px] border border-[#dfe5e1] px-3 py-1.5 text-sm font-semibold text-[#334155]">
                {pageSize}
              </span>
              <button
                className="h-9 rounded-[8px] border border-[#dfe5e1] px-3 text-sm font-semibold text-[#334155] transition hover:bg-[#f8faf9] disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                Anterior
              </button>
              <span className="min-w-14 text-center text-sm font-semibold text-[#334155]">
                {page} / {totalPages}
              </span>
              <button
                className="h-9 rounded-[8px] border border-[#dfe5e1] px-3 text-sm font-semibold text-[#334155] transition hover:bg-[#f8faf9] disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                type="button"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
