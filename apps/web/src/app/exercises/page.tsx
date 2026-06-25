'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  apiFetch,
  Exercise,
  ExerciseApprovalStatus,
  ExerciseGoal,
  ExerciseOperationalStatus,
  LocalUser,
} from '@/lib/api';

const approvalLabels: Record<ExerciseApprovalStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

const operationalLabels: Record<ExerciseOperationalStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

const goalLabels: Record<ExerciseGoal, string> = {
  STRENGTH: 'Fuerza',
  MOBILITY: 'Movilidad',
  ENDURANCE: 'Cardio',
  POWER: 'Potencia',
  CORE: 'Core',
};

type Filters = {
  search: string;
  primaryMuscleGroup: string;
  goal: string;
  equipmentNeeded: string;
  movementPattern: string;
  approvalStatus: string;
  operationalStatus: string;
};

const emptyFilters: Filters = {
  search: '',
  primaryMuscleGroup: '',
  goal: '',
  equipmentNeeded: '',
  movementPattern: '',
  approvalStatus: '',
  operationalStatus: '',
};

function Icon({
  type,
  className = 'h-4 w-4',
}: {
  type: 'search' | 'filter' | 'plus' | 'chevron' | 'eye' | 'pencil' | 'check' | 'x';
  className?: string;
}) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {type === 'search' ? <path d="m20 20-4.5-4.5m1.5-5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /> : null}
      {type === 'filter' ? <path d="M4 6h16M7 12h10m-7 6h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /> : null}
      {type === 'plus' ? <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /> : null}
      {type === 'chevron' ? <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'eye' ? <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /></> : null}
      {type === 'pencil' ? <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'check' ? <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /> : null}
      {type === 'x' ? <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /> : null}
    </svg>
  );
}

const API_PAGE_SIZE = 100;
const TABLE_PAGE_SIZE = 10;

function buildQuery(
  filters: Filters,
  pagination?: { page: number; limit: number },
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  if (pagination) {
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));
  }

  const query = params.toString();

  return query ? `?${query}` : '';
}

async function fetchAllExercises(filters: Filters) {
  const rows: Exercise[] = [];
  let page = 1;

  while (true) {
    const pageRows = await apiFetch<Exercise[]>(
      `/exercises${buildQuery(filters, { page, limit: API_PAGE_SIZE })}`,
    );

    rows.push(...pageRows);

    if (pageRows.length < API_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return rows;
}

function uniqueValues(exercises: Exercise[], key: keyof Pick<Exercise, 'primaryMuscleGroup' | 'equipmentNeeded' | 'movementPattern'>) {
  return [...new Set(exercises.map((exercise) => exercise[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function formatGoals(goals: ExerciseGoal[]) {
  return goals.map((goal) => goalLabels[goal]).join(', ');
}


function TabLink({
  active,
  children,
  href,
}: {
  active?: boolean;
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      className={`inline-flex h-10 items-center rounded-[8px] px-4 text-sm font-black transition ${
        active ? 'bg-[#dcf3e4] text-[#087a3d]' : 'text-[#6b7280] hover:bg-[#eef7f1] hover:text-[#087a3d]'
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-black text-[#17202a]">{children}</label>;
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        className="mt-2 h-11 w-full rounded-[8px] border border-[#dfe5e1] bg-white px-3 text-sm font-normal text-[#0f172a] outline-none transition focus:border-[#087a3d]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusPill({ status }: { status: ExerciseApprovalStatus }) {
  const tone = {
    PENDING: 'bg-[#fff3e6] text-[#c46a12]',
    APPROVED: 'bg-[#eaf6ef] text-[#087a3d]',
    REJECTED: 'bg-[#fdebee] text-[#cf333f]',
  }[status];

  return (
    <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-black ${tone}`}>
      {approvalLabels[status]}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] py-4 last:border-b-0">
      <span className="text-sm text-[#7c8783]">{label}</span>
      <span className="max-w-[240px] text-right text-sm font-semibold text-[#1e293b]">{value}</span>
    </div>
  );
}

export default function ExercisesPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [proposals, setProposals] = useState<Exercise[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showMine, setShowMine] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [confirmation, setConfirmation] = useState<{
    exercise: Exercise;
    action: 'approve' | 'reject';
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const isAdmin = user?.role === 'ADMIN';
  const pendingCount = proposals.filter((exercise) => exercise.approvalStatus === 'PENDING').length;
  const canModerate = (exercise: Exercise) => isAdmin && exercise.approvalStatus === 'PENDING';
  const canEdit = (exercise: Exercise) =>
    isAdmin || (exercise.createdByUserId === user?.id && exercise.approvalStatus === 'PENDING');

  const fieldOptions = useMemo(() => {
    const source = allExercises.length ? allExercises : exercises;

    return {
      muscleGroups: uniqueValues(source, 'primaryMuscleGroup'),
      equipment: uniqueValues(source, 'equipmentNeeded'),
      patterns: uniqueValues(source, 'movementPattern'),
    };
  }, [allExercises, exercises]);

  async function loadCatalog(nextFilters = filters) {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchAllExercises(nextFilters);
      setExercises(rows);
      if (!buildQuery(nextFilters)) {
        setAllExercises(rows);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el catalogo.');
    } finally {
      setLoading(false);
    }
  }

  async function loadProposals() {
    const rows = await apiFetch<Exercise[]>('/exercises/my-proposals');
    setProposals(rows);
    return rows;
  }

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await apiFetch<{ user: LocalUser }>('/auth/session');
        setUser(response.user);
        const [catalogRows, proposalRows] = await Promise.all([
          fetchAllExercises(emptyFilters),
          loadProposals(),
        ]);
        setExercises(catalogRows);
        setAllExercises(catalogRows);
        if (window.location.hash === '#propuestas') {
          setProposals(proposalRows);
          setShowMine(true);
        }
      } catch {
        router.push('/access-status');
      } finally {
        setLoading(false);
      }
    }

    void loadSession();
  }, [router]);

  function updateFilter(field: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function onSearch() {
    setShowMine(false);
    setPage(1);
    await loadCatalog(filters);
  }

  async function onClear() {
    window.history.replaceState(null, '', '/exercises');
    setFilters(emptyFilters);
    setShowMine(false);
    setPage(1);
    await loadCatalog(emptyFilters);
  }

  async function onShowMine() {
    window.history.replaceState(null, '', '#propuestas');
    setShowMine(true);
    setLoading(true);
    setError('');

    try {
      setProposals(await loadProposals());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudieron cargar tus propuestas.');
    } finally {
      setLoading(false);
    }
  }

  async function onShowCatalog() {
    window.history.replaceState(null, '', '/exercises');
    setShowMine(false);
    setPage(1);
    await loadCatalog(filters);
  }

  function requestDecision(exercise: Exercise, action: 'approve' | 'reject') {
    setConfirmation({ exercise, action });
    setRejectionReason('');
  }

  async function decide(exercise: Exercise, action: 'approve' | 'reject', reason?: string) {
    setBusyId(exercise.id);
    setError('');

    try {
      await apiFetch(`/exercises/${exercise.id}/${action}`, {
        method: 'PATCH',
        body: action === 'reject' ? JSON.stringify({ reason: reason || undefined }) : undefined,
      });

      const [catalogRows, proposalRows] = await Promise.all([
        fetchAllExercises(filters),
        loadProposals(),
      ]);
      setExercises(catalogRows);
      if (!buildQuery(filters)) {
        setAllExercises(catalogRows);
      }
      setProposals(proposalRows);
      setSelectedExercise((current) => (current?.id === exercise.id ? null : current));
      setConfirmation(null);
      setRejectionReason('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo actualizar el ejercicio.');
    } finally {
      setBusyId(null);
    }
  }

  const visibleRows = showMine ? proposals : exercises;
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / TABLE_PAGE_SIZE));
  const pagedRows = showMine ? visibleRows : visibleRows.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a]">
            {showMine ? 'Mis propuestas' : isAdmin ? 'Catalogo completo' : 'Catalogo de ejercicios'}
          </h1>
          <p className="mt-2 text-base text-[#6b7280]">
            {showMine ? 'Ejercicios que enviaste a revision.' : 'Fuente controlada para rutinas e IA futura.'}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {isAdmin ? <TabLink href="/exercises/coverage">Cobertura</TabLink> : null}
          <button
            className={`inline-flex h-10 items-center gap-2 rounded-[8px] px-4 text-sm font-black transition ${
              showMine ? 'bg-[#dcf3e4] text-[#087a3d]' : 'text-[#6b7280] hover:bg-[#eef7f1] hover:text-[#087a3d]'
            }`}
            onClick={onShowMine}
            type="button"
          >
            Mis propuestas
            {pendingCount ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c8751b] px-1 text-xs text-white">
                {pendingCount}
              </span>
            ) : null}
          </button>
          <Link
            className="inline-flex h-12 items-center gap-2 rounded-[8px] bg-[#0aa34a] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(8,122,61,0.18)] transition hover:bg-[#087a3d]"
            href="/exercises/new"
          >
            <Icon type="plus" />
            Nuevo ejercicio
          </Link>
          <button
            className={`inline-flex h-10 items-center rounded-[8px] px-4 text-sm font-black transition ${
              !showMine ? 'bg-[#dcf3e4] text-[#087a3d]' : 'text-[#6b7280] hover:bg-[#eef7f1] hover:text-[#087a3d]'
            }`}
            onClick={onShowCatalog}
            type="button"
          >
            Catalogo
          </button>
        </nav>
      </header>

      {!showMine ? (
        <section className="rounded-[14px] border border-[#dfe5e1] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <FieldLabel>Buscar</FieldLabel>
              <div className="mt-2 flex h-11 items-center gap-3 rounded-[8px] border border-[#dfe5e1] px-3 text-[#9ca3af] focus-within:border-[#087a3d]">
                <Icon type="search" />
                <input
                  className="min-w-0 flex-1 text-sm text-[#0f172a] outline-none placeholder:text-[#9ca3af]"
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Nombre del ejercicio..."
                  value={filters.search}
                />
              </div>
            </div>
            <SelectField
              label="Grupo muscular"
              onChange={(value) => updateFilter('primaryMuscleGroup', value)}
              options={[{ value: '', label: 'Todos los grupos' }, ...fieldOptions.muscleGroups.map((value) => ({ value, label: value }))]}
              value={filters.primaryMuscleGroup}
            />
            <SelectField
              label="Equipamiento"
              onChange={(value) => updateFilter('equipmentNeeded', value)}
              options={[{ value: '', label: 'Todo el equipamiento' }, ...fieldOptions.equipment.map((value) => ({ value, label: value }))]}
              value={filters.equipmentNeeded}
            />
            <SelectField
              label="Patron"
              onChange={(value) => updateFilter('movementPattern', value)}
              options={[{ value: '', label: 'Todos los patrones' }, ...fieldOptions.patterns.map((value) => ({ value, label: value }))]}
              value={filters.movementPattern}
            />
            <SelectField
              label="Objetivos"
              onChange={(value) => updateFilter('goal', value)}
              options={[{ value: '', label: 'Todos los objetivos' }, ...Object.entries(goalLabels).map(([value, label]) => ({ value, label }))]}
              value={filters.goal}
            />
            {isAdmin ? (
              <>
                <SelectField
                  label="Aprobacion"
                  onChange={(value) => updateFilter('approvalStatus', value)}
                  options={[{ value: '', label: 'Cualquier aprobacion' }, ...Object.entries(approvalLabels).map(([value, label]) => ({ value, label }))]}
                  value={filters.approvalStatus}
                />
                <SelectField
                  label="Operacion"
                  onChange={(value) => updateFilter('operationalStatus', value)}
                  options={[{ value: '', label: 'Cualquier operacion' }, ...Object.entries(operationalLabels).map(([value, label]) => ({ value, label }))]}
                  value={filters.operationalStatus}
                />
              </>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#0aa34a] px-5 text-sm font-semibold text-white transition hover:bg-[#087a3d]" onClick={onSearch} type="button">
              <Icon type="filter" />
              Filtrar
            </button>
            <button className="h-11 rounded-[8px] border border-[#dfe5e1] px-5 text-sm font-normal text-[#334155] transition hover:border-[#b8c5bd] hover:bg-[#f8faf9]" onClick={onClear} type="button">
              Limpiar
            </button>
          </div>
        </section>
      ) : null}

      {error ? <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p> : null}
      {loading ? <p className="rounded-[8px] border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#64748b]">Cargando...</p> : null}

      {!loading && showMine ? (
        <section className="space-y-3">
          {visibleRows.map((exercise) => (
            <article className="flex min-h-17 flex-col gap-4 rounded-[14px] border border-[#dfe5e1] bg-white px-5 py-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between" key={exercise.id}>
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-[#0f172a]">{exercise.name}</h2>
                <p className="mt-1 truncate text-sm text-[#6b7280]">
                  {exercise.primaryMuscleGroup} · {exercise.movementPattern} · {exercise.equipmentNeeded}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <StatusPill status={exercise.approvalStatus} />
                  <div className="flex items-center gap-0.5">
                  {canModerate(exercise) ? (
                    <>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#16a34a] transition hover:bg-[#f0fdf4] disabled:opacity-40"
                        disabled={busyId === exercise.id}
                        onClick={() => requestDecision(exercise, 'approve')}
                        title="Aprobar"
                        type="button"
                      >
                        <Icon type="check" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#dc2626] transition hover:bg-[#fef2f2] disabled:opacity-40"
                        disabled={busyId === exercise.id}
                        onClick={() => requestDecision(exercise, 'reject')}
                        title="Cancelar"
                        type="button"
                      >
                        <Icon type="x" />
                      </button>
                    </>
                  ) : null}
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#334155]"
                    onClick={() => setSelectedExercise(exercise)}
                    title="Ver detalle"
                    type="button"
                  >
                    <Icon type="eye" />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!visibleRows.length ? <p className="rounded-[14px] border border-[#dfe5e1] bg-white px-5 py-8 text-center text-sm text-[#64748b]">No hay propuestas para esta vista.</p> : null}
        </section>
      ) : null}

      {!loading && !showMine ? (
        <section className="overflow-hidden rounded-[14px] border border-[#dfe5e1] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead className="text-[#7c8783]">
                <tr className="border-b border-[#e8eee9]">
                  <th className="px-6 py-4 font-black">Ejercicio</th>
                  <th className="px-6 py-4 font-black">Grupo</th>
                  <th className="px-6 py-4 font-black">Objetivos</th>
                  <th className="px-6 py-4 font-black">Estado</th>
                  <th className="px-6 py-4 font-black">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((exercise) => (
                  <tr className="border-b border-[#edf1ee] last:border-b-0" key={exercise.id}>
                    <td className="px-6 py-4">
                      <p className="font-black text-[#0f172a]">{exercise.name}</p>
                      <p className="mt-1 text-sm text-[#7c8783]">{exercise.equipmentNeeded}</p>
                    </td>
                    <td className="px-6 py-4 text-[#1f2937]">{exercise.primaryMuscleGroup}</td>
                    <td className="px-6 py-4 text-[#1f2937]">{formatGoals(exercise.goals)}</td>
                    <td className="px-6 py-4">
                      <span className={exercise.approvalStatus === 'APPROVED' ? 'font-black text-[#087a3d]' : 'font-black text-[#c8751b]'}>
                        {approvalLabels[exercise.approvalStatus]}
                      </span>
                      <span className="px-2 text-[#7c8783]">/</span>
                      <span className="font-semibold text-[#0f172a]">{operationalLabels[exercise.operationalStatus]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        {canModerate(exercise) ? (
                          <>
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#16a34a] transition hover:bg-[#f0fdf4] disabled:opacity-40"
                              disabled={busyId === exercise.id}
                              onClick={() => requestDecision(exercise, 'approve')}
                              title="Aprobar"
                              type="button"
                            >
                              <Icon type="check" />
                            </button>
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#dc2626] transition hover:bg-[#fef2f2] disabled:opacity-40"
                              disabled={busyId === exercise.id}
                              onClick={() => requestDecision(exercise, 'reject')}
                              title="Cancelar"
                              type="button"
                            >
                              <Icon type="x" />
                            </button>
                          </>
                        ) : null}
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#334155]"
                          onClick={() => setSelectedExercise(exercise)}
                          title="Ver detalle"
                          type="button"
                        >
                          <Icon type="eye" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!visibleRows.length ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-[#64748b]" colSpan={6}>
                      No hay ejercicios para esta vista.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-[#e8eee9] px-6 py-4">
              <p className="text-sm text-[#6b7280]">
                {(page - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(page * TABLE_PAGE_SIZE, visibleRows.length)} de {visibleRows.length} ejercicios
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="flex h-9 items-center gap-1 rounded-[8px] border border-[#dfe5e1] px-3 text-sm font-semibold text-[#374151] transition hover:border-[#b8c5bd] hover:bg-[#f8faf9] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  type="button"
                >
                  Anterior
                </button>
                <span className="px-3 text-sm text-[#6b7280]">
                  {page} / {totalPages}
                </span>
                <button
                  className="flex h-9 items-center gap-1 rounded-[8px] border border-[#dfe5e1] px-3 text-sm font-semibold text-[#374151] transition hover:border-[#b8c5bd] hover:bg-[#f8faf9] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {selectedExercise ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[#0f172a]/42 backdrop-blur-[3px]"
          onClick={() => setSelectedExercise(null)}
        >
          <aside
            className="h-full w-full max-w-[460px] overflow-y-auto bg-white px-7 py-8 shadow-[-24px_0_60px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9]"
                onClick={() => setSelectedExercise(null)}
                title="Cerrar"
                type="button"
              >
                <Icon type="x" />
              </button>
            </div>

            <div className="mt-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-[#1e293b]">{selectedExercise.name}</h2>
                  <p className="mt-1 text-sm text-[#64748b]">Ejercicio</p>
                </div>
                <StatusPill status={selectedExercise.approvalStatus} />
              </div>
              <p className="mt-5 text-sm leading-6 text-[#475569]">
                {selectedExercise.description || 'Sin descripcion.'}
              </p>
            </div>

            <div className="mt-7 space-y-0 border-y border-[#e5e7eb]">
              <DetailRow label="Grupo muscular" value={selectedExercise.primaryMuscleGroup} />
              <DetailRow label="Secundarios" value={selectedExercise.secondaryMuscleGroups.length ? selectedExercise.secondaryMuscleGroups.join(', ') : '-'} />
              <DetailRow label="Objetivos" value={formatGoals(selectedExercise.goals)} />
              <DetailRow label="Equipamiento" value={selectedExercise.equipmentNeeded} />
              <DetailRow label="Patron" value={selectedExercise.movementPattern} />
              <DetailRow label="Operacion" value={operationalLabels[selectedExercise.operationalStatus]} />
              <DetailRow label="Errores comunes" value={selectedExercise.commonMistakes || '-'} />
              <DetailRow label="Contraindicaciones" value={selectedExercise.contraindications || '-'} />
              <DetailRow label="Motivo rechazo" value={selectedExercise.rejectionReason || '-'} />
            </div>

            <section className="mt-7">
              <h3 className="text-sm font-black text-[#1e293b]">Instrucciones tecnicas</h3>
              <p className="mt-3 rounded-[10px] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#475569]">
                {selectedExercise.technicalInstructions || '-'}
              </p>
            </section>

            {canEdit(selectedExercise) ? (
              <Link
                className="mt-7 flex h-12 items-center justify-center rounded-[10px] bg-[#087a3d] text-sm font-black text-white shadow-[0_12px_28px_rgba(8,122,61,0.18)] transition hover:bg-[#076b36]"
                href={`/exercises/${selectedExercise.id}/edit`}
              >
                Editar ejercicio
              </Link>
            ) : null}
          </aside>
        </div>
      ) : null}

      {confirmation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/38 px-4 backdrop-blur-[3px]">
          <section className="w-full max-w-[440px] rounded-[18px] bg-white p-7 shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-[12px] ${
                confirmation.action === 'approve'
                  ? 'bg-[#e7f6ee] text-[#16a34a]'
                  : 'bg-[#fde7ed] text-[#dc2626]'
              }`}
            >
              <Icon className="h-6 w-6" type={confirmation.action === 'approve' ? 'check' : 'x'} />
            </div>

            <h2 className="mt-5 text-2xl font-black tracking-[-0.02em] text-[#1f2933]">
              {confirmation.action === 'approve' ? 'Aprobar ejercicio' : 'Cancelar propuesta'}
            </h2>
            <p className="mt-2 text-base leading-7 text-[#7c8783]">
              {confirmation.action === 'approve' ? (
                <>
                  Vas a aprobar{' '}
                  <span className="font-black text-[#374151]">{confirmation.exercise.name}</span>.
                  Quedara activo dentro del catalogo.
                </>
              ) : (
                <>
                  Vas a cancelar la propuesta{' '}
                  <span className="font-black text-[#374151]">{confirmation.exercise.name}</span>.
                  No quedara disponible en la grilla activa.
                </>
              )}
            </p>

            <div className="mt-5 rounded-[12px] border border-[#e5e7eb] p-4">
              <p className="truncate text-sm font-black text-[#1f2933]">{confirmation.exercise.name}</p>
              <p className="mt-1 truncate text-sm text-[#7c8783]">
                {confirmation.exercise.primaryMuscleGroup} · {confirmation.exercise.movementPattern} · {confirmation.exercise.equipmentNeeded}
              </p>
            </div>

            {confirmation.action === 'reject' ? (
              <textarea
                className="mt-4 min-h-20 w-full resize-y rounded-[12px] border border-[#e5e7eb] px-4 py-3 text-sm text-[#1f2933] outline-none transition placeholder:text-[#8a9691] focus:border-[#dc2626]"
                placeholder="Motivo de cancelacion (opcional)..."
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
              />
            ) : null}

            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-12 rounded-[10px] bg-[#f1f4f3] px-5 text-sm font-black text-[#374151] transition hover:bg-[#e5e7eb]"
                onClick={() => {
                  setConfirmation(null);
                  setRejectionReason('');
                }}
                type="button"
              >
                Volver
              </button>
              <button
                className={`h-12 rounded-[10px] px-5 text-sm font-black text-white transition disabled:opacity-60 ${
                  confirmation.action === 'approve'
                    ? 'bg-[#16a34a] hover:bg-[#15803d]'
                    : 'bg-[#c83c50] hover:bg-[#b83245]'
                }`}
                disabled={busyId === confirmation.exercise.id}
                onClick={() =>
                  void decide(
                    confirmation.exercise,
                    confirmation.action,
                    rejectionReason.trim(),
                  )
                }
                type="button"
              >
                {confirmation.action === 'approve' ? 'Si, aprobar' : 'Si, cancelar'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
