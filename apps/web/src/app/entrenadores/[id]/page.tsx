'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, LocalUser } from '@/lib/api';

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

function Icon({
  type,
  className = 'h-5 w-5',
}: {
  type: 'chevron' | 'check' | 'x' | 'mail' | 'user';
  className?: string;
}) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {type === 'chevron' ? <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'check' ? <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /> : null}
      {type === 'x' ? <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /> : null}
      {type === 'mail' ? <path d="M4 6h16v12H4V6Zm0 1 8 6 8-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'user' ? <><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></> : null}
    </svg>
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

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#1e293b]">{value || '-'}</p>
    </div>
  );
}

export default function TrainerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [trainers, setTrainers] = useState<LocalUser[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const trainer = useMemo(
    () => trainers.find((item) => item.id === params.id) ?? null,
    [params.id, trainers],
  );

  async function loadTrainer() {
    setError('');
    try {
      const session = await apiFetch<{ user: LocalUser }>('/auth/session');
      if (session.user.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      setTrainers(await apiFetch<LocalUser[]>('/users/trainers'));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el entrenador.');
    }
  }

  useEffect(() => {
    void loadTrainer();
  }, []);

  async function decide(action: 'approve' | 'reject') {
    if (!trainer) return;
    setBusy(true);
    setError('');
    try {
      await apiFetch(`/users/${trainer.id}/${action}`, {
        method: 'PATCH',
        body: action === 'reject' ? JSON.stringify({}) : undefined,
      });
      await loadTrainer();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo actualizar el entrenador.');
    } finally {
      setBusy(false);
    }
  }

  if (error && !trainer) {
    return (
      <>
        <div className="mb-6 flex items-center gap-2 text-sm text-[#64748b]">
          <Link className="hover:text-[#087a3d]" href="/entrenadores">Entrenadores</Link>
          <Icon className="h-4 w-4" type="chevron" />
          <span>Detalle</span>
        </div>
        <p className="rounded-[8px] border border-[#b3261e]/30 bg-white px-5 py-4 text-sm text-[#b3261e]">{error}</p>
      </>
    );
  }

  if (!trainer) {
    return <p className="rounded-[12px] border border-[#e5e7eb] bg-white p-8 text-sm text-[#64748b]">Cargando entrenador...</p>;
  }

  const isPending = trainer.status === 'PENDING_APPROVAL';

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/entrenadores">Entrenadores</Link>
        <Icon className="h-4 w-4" type="chevron" />
        <span className="font-medium text-[#1e293b]">{trainer.firstName} {trainer.lastName}</span>
      </div>

      <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#f1f5f9] px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcfce7] text-base font-black text-[#15803d]">
              {(trainer.firstName[0] ?? '').toUpperCase()}{(trainer.lastName[0] ?? '').toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-[-0.03em] text-[#0f172a]">
                {trainer.firstName} {trainer.lastName}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#64748b]">
                <Icon className="h-4 w-4" type="mail" />
                {trainer.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={trainer.status} />
            <button
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isPending && !busy ? 'text-[#16a34a] hover:bg-[#f0fdf4]' : 'cursor-not-allowed text-[#d1d5db] opacity-40'}`}
              disabled={!isPending || busy}
              onClick={() => void decide('approve')}
              title="Aprobar"
              type="button"
            >
              <Icon className="h-4 w-4" type="check" />
            </button>
            <button
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isPending && !busy ? 'text-[#dc2626] hover:bg-[#fef2f2]' : 'cursor-not-allowed text-[#d1d5db] opacity-40'}`}
              disabled={!isPending || busy}
              onClick={() => void decide('reject')}
              title="Rechazar"
              type="button"
            >
              <Icon className="h-4 w-4" type="x" />
            </button>
          </div>
        </div>

        {error ? <p className="mx-6 mt-4 text-sm text-[#dc2626]">{error}</p> : null}

        <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Nombre" value={`${trainer.firstName} ${trainer.lastName}`} />
          <InfoItem label="Email" value={trainer.email} />
          <InfoItem label="Rol" value="Entrenador" />
          <InfoItem label="Creado" value={new Date(trainer.createdAt).toLocaleDateString('es-AR')} />
          <InfoItem label="Estado" value={statusConfig[trainer.status].label} />
          <InfoItem label="Tenant" value={trainer.tenantId} />
          <InfoItem label="ID usuario" value={trainer.id} />
        </div>
      </section>
    </>
  );
}
