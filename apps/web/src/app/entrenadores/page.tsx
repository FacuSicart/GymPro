'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, LocalUser } from '@/lib/api';

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

const statusConfig: Record<
  LocalUser['status'],
  { label: string; bg: string; textColor: string; dotColor: string }
> = {
  PENDING_APPROVAL: { label: 'Pendiente', bg: '#fffbeb', textColor: '#b45309', dotColor: '#f59e0b' },
  ACTIVE: { label: 'Activo', bg: '#f0fdf4', textColor: '#15803d', dotColor: '#22c55e' },
  REJECTED: { label: 'Rechazado', bg: '#fef2f2', textColor: '#dc2626', dotColor: '#ef4444' },
  SUSPENDED: { label: 'Suspendido', bg: '#fff7ed', textColor: '#c2410c', dotColor: '#f97316' },
  DEACTIVATED: { label: 'Desactivado', bg: '#f8fafc', textColor: '#64748b', dotColor: '#94a3b8' },
};

const statusFilterOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pendientes', value: 'PENDING_APPROVAL' },
  { label: 'Activos', value: 'ACTIVE' },
  { label: 'Rechazados', value: 'REJECTED' },
  { label: 'Suspendidos', value: 'SUSPENDED' },
];

function Icon({
  type,
  className = 'h-4 w-4',
}: {
  type: 'search' | 'filter' | 'check' | 'x' | 'eye' | 'chevron' | 'users';
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
      {type === 'check' && (
        <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      )}
      {type === 'x' && (
        <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      )}
      {type === 'eye' && (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        </>
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

function StatusBadge({ status }: { status: LocalUser['status'] }) {
  const cfg = statusConfig[status];
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

function getStatusFilter() {
  if (typeof window === 'undefined') return '';
  return (new URLSearchParams(window.location.search).get('status') ?? '') as LocalUser['status'] | '';
}

export default function TrainersPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<LocalUser[]>([]);
  const [statusFilter, setStatusFilter] = useState<LocalUser['status'] | ''>('');
  const [search, setSearch] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [onlyPendingActions, setOnlyPendingActions] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<LocalUser | null>(null);
  const [confirmation, setConfirmation] = useState<{
    trainer: LocalUser;
    action: 'approve' | 'reject';
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const visibleTrainers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const fromTime = createdFrom ? new Date(`${createdFrom}T00:00:00`).getTime() : null;
    const toTime = createdTo ? new Date(`${createdTo}T23:59:59`).getTime() : null;

    return trainers.filter((trainer) => {
      const fullName = `${trainer.firstName} ${trainer.lastName}`.toLowerCase();
      const createdTime = new Date(trainer.createdAt).getTime();
      const matchesStatus = statusFilter ? trainer.status === statusFilter : true;
      const matchesSearch = normalizedSearch
        ? fullName.includes(normalizedSearch) || trainer.email.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesFrom = fromTime ? createdTime >= fromTime : true;
      const matchesTo = toTime ? createdTime <= toTime : true;
      const matchesPending = onlyPendingActions ? trainer.status === 'PENDING_APPROVAL' : true;
      return matchesStatus && matchesSearch && matchesFrom && matchesTo && matchesPending;
    });
  }, [createdFrom, createdTo, onlyPendingActions, search, statusFilter, trainers]);

  const totalPages = Math.max(1, Math.ceil(visibleTrainers.length / pageSize));
  const paginatedTrainers = visibleTrainers.slice((page - 1) * pageSize, page * pageSize);

  async function loadTrainers(nextStatus = getStatusFilter()) {
    setLoading(true);
    setError('');
    setStatusFilter(nextStatus);
    try {
      setTrainers(await apiFetch<LocalUser[]>('/users/trainers'));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar entrenadores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const response = await apiFetch<{ user: LocalUser }>('/auth/session');
        if (response.user.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
        await loadTrainers();
      } catch {
        router.push('/access-status');
      }
    }
    void verifyAdmin();
  }, [router]);

  function selectStatus(nextStatus: LocalUser['status'] | '') {
    const href = nextStatus
      ? `/entrenadores?status=${encodeURIComponent(nextStatus)}`
      : '/entrenadores';
    window.history.replaceState(null, '', href);
    setStatusFilter(nextStatus);
    setPage(1);
  }

  function clearFilters() {
    setCreatedFrom('');
    setCreatedTo('');
    setOnlyPendingActions(false);
    setStatusFilter('');
    window.history.replaceState(null, '', '/entrenadores');
    setPage(1);
  }

  function requestDecision(trainer: LocalUser, action: 'approve' | 'reject') {
    setConfirmation({ trainer, action });
    setRejectionReason('');
  }

  async function decide(id: string, action: 'approve' | 'reject' | 'deactivate', reason?: string) {
    setBusyId(id);
    setError('');
    try {
      await apiFetch(`/users/${id}/${action}`, {
        method: 'PATCH',
        body: action === 'reject' ? JSON.stringify({ reason: reason || undefined }) : undefined,
      });
      await loadTrainers(statusFilter);
      setSelectedTrainer(null);
      setConfirmation(null);
      setRejectionReason('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo actualizar.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-black tracking-[-0.03em] text-[#0f172a]">Entrenadores</h1>
        <p className="mt-3 text-base text-[#475569]">
          Revisá y gestioná las solicitudes y cuentas de entrenadores.
        </p>
      </div>

      <section className="mt-7 overflow-hidden rounded-2xl border border-[#e8eef2] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
        {/* Barra de búsqueda */}
        <div className="flex items-center gap-3 border-b border-[#f1f5f9] px-6 py-4">
          <div className="relative flex-1">
            <Icon
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"
              type="search"
            />
            <input
              className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] pl-10 pr-4 text-sm text-[#1e293b] outline-none placeholder:text-[#94a3b8] focus:border-[#087a3d] focus:bg-white transition"
              placeholder="Buscar por nombre o email..."
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
              Estado
              <select
                className="mt-2 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#087a3d]"
                value={statusFilter}
                onChange={(e) => selectStatus(e.target.value as LocalUser['status'] | '')}
              >
                {statusFilterOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
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
            <div className="flex flex-col justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                <input
                  checked={onlyPendingActions}
                  className="h-3.5 w-3.5 accent-[#087a3d]"
                  type="checkbox"
                  onChange={(e) => {
                    setOnlyPendingActions(e.target.checked);
                    setPage(1);
                  }}
                />
                Solo pendientes de acción
              </label>
              <button
                className="mt-3 w-fit rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-white"
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
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f1f5f9]">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrainers.map((trainer) => {
                  const isPending = trainer.status === 'PENDING_APPROVAL';
                  const isBusy = busyId === trainer.id;
                  return (
                    <tr
                      className="border-t border-[#f8fafc] transition hover:bg-[#fafbfc]"
                      key={trainer.id}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={trainer.firstName} lastName={trainer.lastName} />
                          <p className="text-sm font-semibold text-[#1e293b]">
                            {trainer.firstName} {trainer.lastName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#1e293b]">{trainer.email}</td>
                      <td className="px-6 py-4 text-sm text-[#64748b]">
                        {relativeTime(trainer.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#475569]">Entrenador</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trainer.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-0.5">
                          {isPending ? (
                            <>
                              <button
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                                  !isBusy
                                    ? 'text-[#16a34a] hover:bg-[#f0fdf4]'
                                    : 'cursor-not-allowed text-[#d1d5db] opacity-40'
                                }`}
                                disabled={isBusy}
                                onClick={() => requestDecision(trainer, 'approve')}
                                title="Aprobar"
                                type="button"
                              >
                                <Icon type="check" />
                              </button>
                              <button
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                                  !isBusy
                                    ? 'text-[#dc2626] hover:bg-[#fef2f2]'
                                    : 'cursor-not-allowed text-[#d1d5db] opacity-40'
                                }`}
                                disabled={isBusy}
                                onClick={() => requestDecision(trainer, 'reject')}
                                title="Rechazar"
                                type="button"
                              >
                                <Icon type="x" />
                              </button>
                            </>
                          ) : null}
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#475569]"
                            onClick={() => setSelectedTrainer(trainer)}
                            title="Ver detalle"
                            type="button"
                          >
                            <Icon type="eye" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!paginatedTrainers.length ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f5f9]">
                  <Icon className="h-8 w-8 text-[#94a3b8]" type="users" />
                </div>
                <p className="mt-4 text-sm font-semibold text-[#334155]">
                  No hay entrenadores para esta vista.
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
            Mostrando {visibleTrainers.length ? (page - 1) * pageSize + 1 : 0}–
            {Math.min(page * pageSize, visibleTrainers.length)} de {visibleTrainers.length}
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

      {selectedTrainer ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[#0f172a]/42 backdrop-blur-[3px]"
          onClick={() => setSelectedTrainer(null)}
        >
          <aside
            className="h-full w-full max-w-[420px] bg-white px-7 py-8 shadow-[-24px_0_60px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9]"
                onClick={() => setSelectedTrainer(null)}
                title="Cerrar"
                type="button"
              >
                <Icon type="x" />
              </button>
            </div>

            <div className="mt-3 flex items-start gap-4">
              <Avatar firstName={selectedTrainer.firstName} lastName={selectedTrainer.lastName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-[#1e293b]">
                      {selectedTrainer.firstName} {selectedTrainer.lastName}
                    </h2>
                    <p className="mt-1 text-sm text-[#64748b]">Entrenador</p>
                  </div>
                  <StatusBadge status={selectedTrainer.status} />
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-0 border-y border-[#e5e7eb]">
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] py-4">
                <span className="text-sm text-[#7c8783]">Tenant</span>
                <span className="max-w-[220px] truncate text-right text-sm font-semibold text-[#1e293b]">
                  {selectedTrainer.tenantId}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] py-4">
                <span className="text-sm text-[#7c8783]">ID usuario</span>
                <span className="max-w-[220px] truncate text-right text-sm font-semibold text-[#1e293b]">
                  {selectedTrainer.id}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 py-4">
                <span className="text-sm text-[#7c8783]">Motivo de rechazo</span>
                <span className="max-w-[220px] text-right text-sm font-semibold text-[#1e293b]">
                  {selectedTrainer.rejectionReason || '-'}
                </span>
              </div>
            </div>

            {selectedTrainer.status === 'PENDING_APPROVAL' ? (
              <div className="mt-6 flex gap-3">
                <button
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#16a34a] text-sm font-black text-white shadow-[0_12px_28px_rgba(22,163,74,0.22)] transition hover:bg-[#15803d] disabled:opacity-60"
                  disabled={busyId === selectedTrainer.id}
                  onClick={() => requestDecision(selectedTrainer, 'approve')}
                  type="button"
                >
                  <Icon type="check" />
                  Aprobar
                </button>
                <button
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#fee2e2] text-sm font-black text-[#dc2626] transition hover:bg-[#fecaca] disabled:opacity-60"
                  disabled={busyId === selectedTrainer.id}
                  onClick={() => requestDecision(selectedTrainer, 'reject')}
                  type="button"
                >
                  <Icon type="x" />
                  Rechazar
                </button>
              </div>
            ) : null}

            {selectedTrainer.status === 'ACTIVE' ? (
              <button
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#fee2e2] text-sm font-black text-[#dc2626] transition hover:bg-[#fecaca] disabled:opacity-60"
                disabled={busyId === selectedTrainer.id}
                onClick={() => void decide(selectedTrainer.id, 'deactivate')}
                type="button"
              >
                <Icon type="x" />
                Dar baja virtual
              </button>
            ) : null}

            {!['PENDING_APPROVAL', 'ACTIVE'].includes(selectedTrainer.status) ? (
              <p className="mt-6 rounded-[10px] bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-[#64748b]">
                Sin acciones disponibles para este estado.
              </p>
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
              {confirmation.action === 'approve' ? 'Aprobar entrenador' : 'Rechazar solicitud'}
            </h2>
            <p className="mt-2 text-base leading-7 text-[#7c8783]">
              {confirmation.action === 'approve' ? (
                <>
                  Vas a aprobar a{' '}
                  <span className="font-black text-[#374151]">
                    {confirmation.trainer.firstName} {confirmation.trainer.lastName}
                  </span>
                  . Recibira acceso a la plataforma y podra empezar a gestionar alumnos.
                </>
              ) : (
                <>
                  Vas a rechazar la solicitud de{' '}
                  <span className="font-black text-[#374151]">
                    {confirmation.trainer.firstName} {confirmation.trainer.lastName}
                  </span>
                  . No podra ingresar a la plataforma.
                </>
              )}
            </p>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-[12px] border border-[#e5e7eb] p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar firstName={confirmation.trainer.firstName} lastName={confirmation.trainer.lastName} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#1f2933]">
                    {confirmation.trainer.firstName} {confirmation.trainer.lastName}
                  </p>
                  <p className="truncate text-sm text-[#7c8783]">{confirmation.trainer.email}</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f2f6f4] px-3 py-1 text-xs font-black text-[#7c8783]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8a9691]" />
                Entrenador
              </span>
            </div>

            {confirmation.action === 'reject' ? (
              <textarea
                className="mt-4 min-h-20 w-full resize-y rounded-[12px] border border-[#e5e7eb] px-4 py-3 text-sm text-[#1f2933] outline-none transition placeholder:text-[#8a9691] focus:border-[#dc2626]"
                placeholder="Motivo del rechazo (opcional)..."
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
                Cancelar
              </button>
              <button
                className={`h-12 rounded-[10px] px-5 text-sm font-black text-white transition disabled:opacity-60 ${
                  confirmation.action === 'approve'
                    ? 'bg-[#16a34a] hover:bg-[#15803d]'
                    : 'bg-[#c83c50] hover:bg-[#b83245]'
                }`}
                disabled={busyId === confirmation.trainer.id}
                onClick={() =>
                  void decide(
                    confirmation.trainer.id,
                    confirmation.action,
                    rejectionReason.trim(),
                  )
                }
                type="button"
              >
                {confirmation.action === 'approve' ? 'Si, aprobar' : 'Si, rechazar'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
