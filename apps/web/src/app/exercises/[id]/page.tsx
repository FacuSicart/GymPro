'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  apiFetch,
  Exercise,
  ExerciseApprovalStatus,
  ExerciseGoal,
  ExerciseOperationalStatus,
  LocalUser,
} from '@/lib/api';

const approvalConfig: Record<
  ExerciseApprovalStatus,
  { label: string; bg: string; textColor: string; dotColor: string }
> = {
  PENDING: { label: 'Pendiente', bg: '#fffbeb', textColor: '#b45309', dotColor: '#f59e0b' },
  APPROVED: { label: 'Aprobado', bg: '#f0fdf4', textColor: '#15803d', dotColor: '#22c55e' },
  REJECTED: { label: 'Rechazado', bg: '#fef2f2', textColor: '#dc2626', dotColor: '#ef4444' },
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

function formatGoals(goals: ExerciseGoal[]) {
  return goals.map((goal) => goalLabels[goal]).join(', ');
}

function Icon({
  type,
  className = 'h-5 w-5',
}: {
  type: 'chevron' | 'pencil' | 'check' | 'x' | 'power' | 'link';
  className?: string;
}) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {type === 'chevron' ? <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'pencil' ? <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'check' ? <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /> : null}
      {type === 'x' ? <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /> : null}
      {type === 'power' ? <><path d="M12 3v8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" /><path d="M7.5 6.5a7 7 0 1 0 9 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" /></> : null}
      {type === 'link' ? <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
    </svg>
  );
}

function StatusBadge({ status }: { status: ExerciseApprovalStatus }) {
  const cfg = approvalConfig[status];
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

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-[#1e293b]">
        {value != null && value !== '' ? value : '-'}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#f1f5f9] px-6 py-5">
        <h2 className="text-lg font-black text-[#0f172a]">{title}</h2>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

export default function ExerciseDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const loadExercise = useCallback(async () => {
    const [sessionResponse, exerciseResponse] = await Promise.all([
      apiFetch<{ user: LocalUser }>('/auth/session'),
      apiFetch<Exercise>(`/exercises/${params.id}`),
    ]);
    setUser(sessionResponse.user);
    setExercise(exerciseResponse);
  }, [params.id]);

  useEffect(() => {
    async function load() {
      try {
        await loadExercise();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo cargar el ejercicio.');
      }
    }

    void load();
  }, [loadExercise]);

  async function runAction(action: 'approve' | 'reject' | 'activate' | 'deactivate') {
    setBusy(action);
    setError('');

    try {
      const body =
        action === 'reject'
          ? JSON.stringify({ reason: 'Rechazado desde revision administrativa.' })
          : undefined;
      await apiFetch(`/exercises/${params.id}/${action}`, { method: 'PATCH', body });
      await loadExercise();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo actualizar.');
    } finally {
      setBusy('');
    }
  }

  if (error && !exercise) {
    return (
      <>
        <div className="mb-6 flex items-center gap-2 text-sm text-[#64748b]">
          <Link className="hover:text-[#087a3d]" href="/exercises">Catalogo</Link>
          <Icon className="h-4 w-4" type="chevron" />
          <span>Detalle</span>
        </div>
        <p className="rounded-[8px] border border-[#b3261e]/30 bg-white px-5 py-4 text-sm text-[#b3261e]">{error}</p>
      </>
    );
  }

  if (!exercise) {
    return <p className="rounded-[12px] border border-[#e5e7eb] bg-white p-8 text-sm text-[#64748b]">Cargando ejercicio...</p>;
  }

  const isAdmin = user?.role === 'ADMIN';
  const canEdit =
    isAdmin ||
    (exercise.createdByUserId === user?.id && exercise.approvalStatus === 'PENDING');
  const canActivate = exercise.approvalStatus === 'APPROVED' && exercise.operationalStatus === 'INACTIVE';
  const canDeactivate = exercise.approvalStatus === 'APPROVED' && exercise.operationalStatus === 'ACTIVE';

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/exercises">Catalogo</Link>
        <Icon className="h-4 w-4" type="chevron" />
        <span className="font-medium text-[#1e293b]">{exercise.name}</span>
      </div>

      <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#f1f5f9] px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcfce7] text-base font-black text-[#15803d]">
              {exercise.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-[-0.03em] text-[#0f172a]">{exercise.name}</h1>
              <p className="mt-2 text-sm text-[#64748b]">{exercise.primaryMuscleGroup} · {exercise.equipmentNeeded}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={exercise.approvalStatus} />
            <span className="inline-flex items-center rounded-full bg-[#f8fafc] px-2.5 py-1 text-xs font-medium text-[#64748b]">
              {operationalLabels[exercise.operationalStatus]}
            </span>
            {canEdit ? (
              <Link
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#087a3d] transition hover:bg-[#f0fdf4]"
                href={`/exercises/${exercise.id}/edit`}
                title="Editar"
              >
                <Icon className="h-4 w-4" type="pencil" />
              </Link>
            ) : null}
            {isAdmin ? (
              <>
                {exercise.approvalStatus === 'PENDING' ? (
                  <>
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-full text-[#16a34a] transition hover:bg-[#f0fdf4] disabled:opacity-40"
                      disabled={Boolean(busy)}
                      onClick={() => void runAction('approve')}
                      title="Aprobar"
                      type="button"
                    >
                      <Icon className="h-4 w-4" type="check" />
                    </button>
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-full text-[#dc2626] transition hover:bg-[#fef2f2] disabled:opacity-40"
                      disabled={Boolean(busy)}
                      onClick={() => void runAction('reject')}
                      title="Rechazar"
                      type="button"
                    >
                      <Icon className="h-4 w-4" type="x" />
                    </button>
                  </>
                ) : null}
                {canDeactivate ? (
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#dc2626] transition hover:bg-[#fef2f2] disabled:opacity-40"
                    disabled={Boolean(busy)}
                    onClick={() => void runAction('deactivate')}
                    title="Desactivar"
                    type="button"
                  >
                    <Icon className="h-4 w-4" type="power" />
                  </button>
                ) : null}
                {canActivate ? (
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#16a34a] transition hover:bg-[#f0fdf4] disabled:opacity-40"
                    disabled={Boolean(busy)}
                    onClick={() => void runAction('activate')}
                    title="Activar"
                    type="button"
                  >
                    <Icon className="h-4 w-4" type="power" />
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {error ? <p className="mx-6 mt-4 text-sm text-[#dc2626]">{error}</p> : null}

        <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Grupo principal" value={exercise.primaryMuscleGroup} />
          <InfoItem label="Objetivos" value={formatGoals(exercise.goals)} />
          <InfoItem label="Operacion" value={operationalLabels[exercise.operationalStatus]} />
          <InfoItem label="Patron" value={exercise.movementPattern} />
          <InfoItem label="Equipamiento" value={exercise.equipmentNeeded} />
          <InfoItem label="Creado" value={new Date(exercise.createdAt).toLocaleDateString('es-AR')} />
          <InfoItem label="ID ejercicio" value={exercise.id} />
        </div>
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Section title="Descripcion">
            <InfoItem label="Resumen" value={exercise.description} />
          </Section>

          <Section title="Tecnica">
            <div className="grid gap-6">
              <InfoItem label="Instrucciones tecnicas" value={exercise.technicalInstructions} />
              <InfoItem label="Errores comunes" value={exercise.commonMistakes} />
              <InfoItem label="Contraindicaciones o restricciones fitness" value={exercise.contraindications} />
            </div>
          </Section>

          {exercise.rejectionReason ? (
            <Section title="Revision">
              <InfoItem label="Motivo de rechazo" value={exercise.rejectionReason} />
            </Section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <Section title="Clasificacion">
            <div className="grid gap-6">
              <InfoItem label="Grupos secundarios" value={exercise.secondaryMuscleGroups.length ? exercise.secondaryMuscleGroups.join(', ') : null} />
              <InfoItem label="Aprobacion" value={approvalConfig[exercise.approvalStatus].label} />
              <InfoItem label="Actualizado" value={new Date(exercise.updatedAt).toLocaleDateString('es-AR')} />
            </div>
          </Section>

          <Section title="Multimedia">
            <div className="space-y-3">
              {exercise.imageUrl ? (
                <a className="flex items-center gap-2 text-sm font-semibold text-[#087a3d]" href={exercise.imageUrl} rel="noreferrer" target="_blank">
                  <Icon className="h-4 w-4" type="link" />
                  Abrir imagen
                </a>
              ) : <p className="text-sm text-[#94a3b8]">Sin imagen.</p>}
              {exercise.videoUrl ? (
                <a className="flex items-center gap-2 text-sm font-semibold text-[#087a3d]" href={exercise.videoUrl} rel="noreferrer" target="_blank">
                  <Icon className="h-4 w-4" type="link" />
                  Abrir video
                </a>
              ) : <p className="text-sm text-[#94a3b8]">Sin video.</p>}
            </div>
          </Section>
        </aside>
      </div>
    </>
  );
}
