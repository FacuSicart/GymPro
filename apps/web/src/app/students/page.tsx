'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, LocalUser, Student, StudentHistoryEvent } from '@/lib/api';

const avatarPalette = [
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#fed7aa', color: '#b45309' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#cffafe', color: '#0e7490' },
  { bg: '#f0fdf4', color: '#166534' },
  { bg: '#fef9c3', color: '#854d0e' },
];

function getAvatarColor(firstName: string, lastName: string) {
  const hash = `${firstName}${lastName}`
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return avatarPalette[hash % avatarPalette.length];
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  if (minutes < 1) return 'Ahora';
  if (hours < 1) return `Hace ${minutes} min`;
  if (days < 1) return `Hace ${hours}h`;
  if (days === 1) return 'Hace 1 día';
  if (days < 30) return `Hace ${days} días`;
  if (months === 1) return 'Hace 1 mes';
  if (months < 12) return `Hace ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
}

const studentStatusConfig: Record<
  Student['status'],
  { label: string; bg: string; textColor: string; dotColor: string }
> = {
  ACTIVE: { label: 'Activo', bg: '#f0fdf4', textColor: '#15803d', dotColor: '#22c55e' },
  ARCHIVED: { label: 'Archivado', bg: '#f8fafc', textColor: '#64748b', dotColor: '#94a3b8' },
};

const goalLabels: Record<string, string> = {
  STRENGTH: 'Fuerza',
  MOBILITY: 'Movilidad',
  ENDURANCE: 'Cardio',
  POWER: 'Potencia',
  CORE: 'Core',
};

const goalFilterOptions = [
  { label: 'Todos', value: '' },
  { label: 'Fuerza', value: 'STRENGTH' },
  { label: 'Movilidad', value: 'MOBILITY' },
  { label: 'Cardio', value: 'ENDURANCE' },
  { label: 'Potencia', value: 'POWER' },
  { label: 'Core', value: 'CORE' },
];

function Icon({
  type,
  className = 'h-4 w-4',
}: {
  type: 'search' | 'filter' | 'eye' | 'pencil' | 'chevron' | 'users' | 'plus' | 'x' | 'clock';
  className?: string;
}) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {type === 'search' && (
        <>
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      )}
      {type === 'filter' && (
        <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      )}
      {type === 'eye' && (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
      {type === 'pencil' && (
        <path
          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      )}
      {type === 'chevron' && (
        <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      )}
      {type === 'users' && (
        <>
          <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M17 10a3 3 0 1 0 0-6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M3 20a6 6 0 0 1 12 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M21 20a6 6 0 0 0-5-5.9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      )}
      {type === 'plus' && (
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      )}
      {type === 'x' && (
        <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      )}
      {type === 'clock' && (
        <>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4l3 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const color = getAvatarColor(firstName, lastName);
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{ backgroundColor: color.bg, color: color.color }}
    >
      {(firstName[0] ?? '').toUpperCase()}
      {(lastName[0] ?? '').toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status: Student['status'] }) {
  const cfg = studentStatusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.textColor }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.dotColor }} />
      {cfg.label}
    </span>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<LocalUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<StudentHistoryEvent[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function load() {
      try {
        const [sessionResponse, studentsResponse] = await Promise.all([
          apiFetch<{ user: LocalUser }>('/auth/session'),
          apiFetch<Student[]>('/students'),
        ]);
        setCurrentUser(sessionResponse.user);
        setStudents(studentsResponse);
        if (sessionResponse.user.role === 'ADMIN') {
          const trainerList = await apiFetch<LocalUser[]>('/users/trainers');
          setTrainers(trainerList);
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo cargar alumnos.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const experiences = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      if (s.profile?.experience) set.add(s.profile.experience);
    }
    return Array.from(set).sort();
  }, [students]);

  const visibleStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const fromTime = createdFrom ? new Date(`${createdFrom}T00:00:00`).getTime() : null;
    const toTime = createdTo ? new Date(`${createdTo}T23:59:59`).getTime() : null;

    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const createdTime = new Date(student.createdAt).getTime();

      const matchesSearch = normalizedSearch
        ? fullName.includes(normalizedSearch) ||
          (student.email ?? '').toLowerCase().includes(normalizedSearch) ||
          (student.profile?.observations ?? '').toLowerCase().includes(normalizedSearch)
        : true;
      const matchesGoal = goalFilter ? student.profile?.goal === goalFilter : true;
      const matchesExperience = experienceFilter
        ? student.profile?.experience === experienceFilter
        : true;
      const matchesTrainer = trainerFilter ? student.trainerId === trainerFilter : true;
      const matchesStatus = statusFilter ? student.status === statusFilter : true;
      const matchesFrom = fromTime ? createdTime >= fromTime : true;
      const matchesTo = toTime ? createdTime <= toTime : true;

      return (
        matchesSearch &&
        matchesGoal &&
        matchesExperience &&
        matchesTrainer &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [
    createdFrom,
    createdTo,
    experienceFilter,
    goalFilter,
    search,
    statusFilter,
    students,
    trainerFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(visibleStudents.length / pageSize));
  const paginatedStudents = visibleStudents.slice((page - 1) * pageSize, page * pageSize);

  function clearFilters() {
    setGoalFilter('');
    setExperienceFilter('');
    setTrainerFilter('');
    setStatusFilter('');
    setCreatedFrom('');
    setCreatedTo('');
    setPage(1);
  }

  function getTrainerName(trainerId: string) {
    const trainer = trainers.find((item) => item.id === trainerId);
    if (trainer) return `${trainer.firstName} ${trainer.lastName}`;
    if (currentUser?.id === trainerId) return `${currentUser.firstName} ${currentUser.lastName}`;
    return 'Sin entrenador asignado';
  }

  async function openStudentDetail(student: Student) {
    setSelectedStudent(student);
    setSelectedHistory([]);
    try {
      setSelectedHistory(await apiFetch<StudentHistoryEvent[]>(`/students/${student.id}/history`));
    } catch {
      setSelectedHistory([]);
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.03em] text-[#0f172a]">Alumnos</h1>
          <p className="mt-3 text-base text-[#475569]">
            Gestioná el perfil deportivo y seguimiento de tus alumnos.
          </p>
        </div>
        <Link
          className="flex h-11 items-center gap-2 rounded-xl bg-[#087a3d] px-5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(8,122,61,0.2)] transition hover:bg-[#076b36]"
          href="/students/new"
        >
          <Icon className="h-4 w-4" type="plus" />
          Nuevo alumno
        </Link>
      </div>

      <section className="mt-7 overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        {/* Barra de búsqueda */}
        <div className="flex items-center gap-3 border-b border-[#f1f5f9] px-6 py-4">
          <div className="relative flex-1">
            <Icon
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"
              type="search"
            />
            <input
              className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] pl-10 pr-4 text-sm text-[#1e293b] outline-none placeholder:text-[#94a3b8] focus:border-[#087a3d] focus:bg-white transition"
              placeholder="Buscar por nombre, email u observaciones..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
              filtersOpen
                ? 'border-[#087a3d] bg-[#eaf6ef] text-[#087a3d]'
                : 'border-[#e2e8f0] text-[#475569] hover:border-[#c4d0d6]'
            }`}
            onClick={() => setFiltersOpen((o) => !o)}
            type="button"
          >
            <Icon type="filter" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {filtersOpen ? (
          <div className="grid gap-4 border-b border-[#f1f5f9] bg-[#f8fafc] px-6 py-4 md:grid-cols-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
              Objetivo
              <select
                className="mt-2 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#087a3d]"
                value={goalFilter}
                onChange={(e) => {
                  setGoalFilter(e.target.value);
                  setPage(1);
                }}
              >
                {goalFilterOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
              Experiencia
              <select
                className="mt-2 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#087a3d]"
                value={experienceFilter}
                onChange={(e) => {
                  setExperienceFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todas</option>
                {experiences.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </label>

            {isAdmin ? (
              <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Entrenador
                <select
                  className="mt-2 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#087a3d]"
                  value={trainerFilter}
                  onChange={(e) => {
                    setTrainerFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todos</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.firstName} {trainer.lastName}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
              Estado
              <select
                className="mt-2 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#087a3d]"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos</option>
                <option value="ACTIVE">Activo</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
              Creado desde
              <input
                className="mt-2 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm outline-none focus:border-[#087a3d]"
                type="date"
                value={createdFrom}
                onChange={(e) => {
                  setCreatedFrom(e.target.value);
                  setPage(1);
                }}
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
              Creado hasta
              <input
                className="mt-2 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm outline-none focus:border-[#087a3d]"
                type="date"
                value={createdTo}
                onChange={(e) => {
                  setCreatedTo(e.target.value);
                  setPage(1);
                }}
              />
            </label>

            <div className="flex items-end">
              <button
                className="w-fit rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-white"
                onClick={clearFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        ) : null}

        {error ? <p className="mx-6 mt-4 text-sm text-[#dc2626]">{error}</p> : null}
        {loading ? <p className="px-6 py-10 text-sm text-[#94a3b8]">Cargando...</p> : null}

        {!loading ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f1f5f9]">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Objetivo
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Experiencia
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Edad
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Peso
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Altura
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr
                    className="border-t border-[#f8fafc] transition hover:bg-[#fafbfc]"
                    key={student.id}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={student.firstName} lastName={student.lastName} />
                        <div>
                          <Link
                            className="text-sm font-semibold text-[#1e293b] transition hover:text-[#087a3d] hover:underline"
                            href={`/students/${student.id}`}
                          >
                            {student.firstName} {student.lastName}
                          </Link>
                          {(student.email ?? student.phone) ? (
                            <p className="text-xs text-[#94a3b8]">
                              {student.email ?? student.phone}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#475569]">
                      {student.profile?.goal
                        ? (goalLabels[student.profile.goal] ?? student.profile.goal)
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#475569]">
                      {student.profile?.experience ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#475569]">
                      {student.profile?.age != null ? student.profile.age : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#475569]">
                      {student.profile?.weightKg != null ? `${student.profile.weightKg} kg` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#475569]">
                      {student.profile?.heightCm != null ? `${student.profile.heightCm} cm` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748b]">
                      {relativeTime(student.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#334155]"
                          onClick={() => void openStudentDetail(student)}
                          title="Ver detalle"
                          type="button"
                        >
                          <Icon type="eye" />
                        </button>
                        <Link
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#087a3d] transition hover:bg-[#f0fdf4]"
                          href={`/students/edit/${student.id}`}
                          title="Editar"
                        >
                          <Icon type="pencil" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!paginatedStudents.length ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f5f9]">
                  <Icon className="h-8 w-8 text-[#94a3b8]" type="users" />
                </div>
                <p className="mt-4 text-sm font-semibold text-[#334155]">
                  No hay alumnos para esta vista.
                </p>
                <p className="mt-1 text-sm text-[#94a3b8]">
                  Cuando existan registros, aparecerán aquí.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Paginación */}
        <div className="flex flex-col gap-3 border-t border-[#f1f5f9] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#64748b]">
            Mostrando {visibleStudents.length ? (page - 1) * pageSize + 1 : 0}–
            {Math.min(page * pageSize, visibleStudents.length)} de {visibleStudents.length}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#64748b]">Filas por página</span>
            <div className="flex h-8 items-center rounded-lg border border-[#e2e8f0] px-3 text-sm font-medium text-[#334155]">
              {pageSize}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] transition hover:border-[#c4d0d6] disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                <Icon className="h-4 w-4 rotate-180" type="chevron" />
              </button>
              <span className="min-w-[3.5rem] text-center text-sm font-medium text-[#334155]">
                {page} / {totalPages}
              </span>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] transition hover:border-[#c4d0d6] disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                type="button"
              >
                <Icon className="h-4 w-4" type="chevron" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedStudent ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[#0f172a]/42 backdrop-blur-[3px]"
          onClick={() => setSelectedStudent(null)}
        >
          <aside
            className="h-full w-full max-w-[460px] overflow-y-auto bg-white px-7 py-8 shadow-[-24px_0_60px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9]"
                onClick={() => setSelectedStudent(null)}
                title="Cerrar"
                type="button"
              >
                <Icon type="x" />
              </button>
            </div>

            <div className="mt-3 flex items-start gap-4">
              <Avatar firstName={selectedStudent.firstName} lastName={selectedStudent.lastName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      className="text-xl font-black text-[#1e293b] transition hover:text-[#087a3d] hover:underline"
                      href={`/students/${selectedStudent.id}`}
                    >
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </Link>
                    <p className="mt-1 text-sm text-[#64748b]">Alumno</p>
                  </div>
                  <StatusBadge status={selectedStudent.status} />
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-0 border-y border-[#e5e7eb]">
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] py-4">
                <span className="text-sm text-[#7c8783]">Email</span>
                <span className="max-w-[240px] truncate text-right text-sm font-semibold text-[#1e293b]">
                  {selectedStudent.email || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] py-4">
                <span className="text-sm text-[#7c8783]">Telefono</span>
                <span className="max-w-[240px] truncate text-right text-sm font-semibold text-[#1e293b]">
                  {selectedStudent.phone || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] py-4">
                <span className="text-sm text-[#7c8783]">Entrenador responsable</span>
                <span className="max-w-[240px] truncate text-right text-sm font-semibold text-[#1e293b]">
                  {getTrainerName(selectedStudent.trainerId)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] py-4">
                <span className="text-sm text-[#7c8783]">Antecedentes</span>
                <span className="max-w-[240px] text-right text-sm font-semibold text-[#1e293b]">
                  {selectedStudent.profile?.previousPhysicalNotes || '-'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] py-4">
                <span className="text-sm text-[#7c8783]">Restricciones</span>
                <span className="max-w-[240px] text-right text-sm font-semibold text-[#1e293b]">
                  {selectedStudent.profile?.restrictions || '-'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] py-4">
                <span className="text-sm text-[#7c8783]">Molestias</span>
                <span className="max-w-[240px] text-right text-sm font-semibold text-[#1e293b]">
                  {selectedStudent.profile?.recurrentDiscomforts || '-'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 py-4">
                <span className="text-sm text-[#7c8783]">Observaciones</span>
                <span className="max-w-[240px] text-right text-sm font-semibold text-[#1e293b]">
                  {selectedStudent.profile?.observations || '-'}
                </span>
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-center gap-2 text-sm font-black text-[#1e293b]">
                <Icon className="h-4 w-4 text-[#087a3d]" type="clock" />
                Historial
              </div>
              <div className="mt-4 space-y-4">
                {selectedHistory.map((event) => (
                  <div className="border-l-2 border-[#087a3d] pl-4" key={event.id}>
                    <p className="text-sm font-semibold text-[#1e293b]">{event.summary}</p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      {new Date(event.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                ))}
                {!selectedHistory.length ? (
                  <p className="text-sm text-[#94a3b8]">Sin eventos todavia.</p>
                ) : null}
              </div>
            </div>

            <Link
              className="mt-7 flex h-12 items-center justify-center rounded-[10px] bg-[#087a3d] text-sm font-black text-white shadow-[0_12px_28px_rgba(8,122,61,0.18)] transition hover:bg-[#076b36]"
              href={`/students/edit/${selectedStudent.id}`}
            >
              Editar alumno
            </Link>
          </aside>
        </div>
      ) : null}
    </>
  );
}
