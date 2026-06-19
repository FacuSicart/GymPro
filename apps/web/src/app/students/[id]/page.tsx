'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  apiFetch,
  LocalUser,
  RecurrentDiscomfortAlert,
  Routine,
  Student,
  StudentHistoryEvent,
  TrainingFeedback,
  TrainingSession,
  TrainingSessionStatus,
} from '@/lib/api';

type TabKey =
  | 'info'
  | 'alerts'
  | 'restrictions'
  | 'observations'
  | 'routines'
  | 'sessions'
  | 'feedback'
  | 'history';

const historyLabels: Record<StudentHistoryEvent['type'], string> = {
  STUDENT_CREATED: 'Alumno creado',
  STUDENT_UPDATED: 'Datos actualizados',
  PROFILE_UPDATED: 'Perfil deportivo actualizado',
  ROUTINE_CREATED: 'Rutina creada',
  ROUTINE_UPDATED: 'Rutina modificada',
  ROUTINE_PUBLISHED: 'Rutina publicada',
  ROUTINE_ARCHIVED: 'Rutina archivada',
  TRAINING_SESSION_CREATED: 'Entrenamiento creado',
  TRAINING_SESSION_STARTED: 'Entrenamiento iniciado',
  TRAINING_SESSION_COMPLETED: 'Entrenamiento completado',
  TRAINING_SESSION_CANCELLED: 'Entrenamiento cancelado',
  TRAINING_SESSION_EXERCISE_UPDATED: 'Ejercicio registrado',
  TRAINING_SESSION_DAY_COMPLETED: 'Dia de entrenamiento completado',
  TRAINING_FEEDBACK_SUBMITTED: 'Feedback enviado',
  TRAINING_FEEDBACK_DISCOMFORT_REPORTED: 'Molestia reportada',
  TRAINING_FEEDBACK_RECURRENT_DISCOMFORT_DETECTED: 'Molestia recurrente detectada',
};

const sessionStatusLabels: Record<TrainingSessionStatus, string> = {
  PLANNED: 'Planificada',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const goalLabels: Record<string, string> = {
  STRENGTH: 'Fuerza',
  HYPERTROPHY: 'Hipertrofia',
  MOBILITY: 'Movilidad',
  ENDURANCE: 'Resistencia',
  CONDITIONING: 'Acondicionamiento',
};

const statusConfig: Record<
  Student['status'],
  { label: string; bg: string; textColor: string; dotColor: string }
> = {
  ACTIVE: { label: 'Activo', bg: '#f0fdf4', textColor: '#15803d', dotColor: '#22c55e' },
  ARCHIVED: { label: 'Archivado', bg: '#f8fafc', textColor: '#64748b', dotColor: '#94a3b8' },
};

const routineStatusLabels = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  ARCHIVED: 'Archivada',
};

function eventSessionLink(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const record = metadata as Record<string, unknown>;
  const sessionId = record.trainingSessionId;
  if (typeof sessionId !== 'string') return null;
  const dayId = record.trainingSessionDayId;
  return typeof dayId === 'string'
    ? `/training-sessions/${sessionId}#${dayId}`
    : `/training-sessions/${sessionId}`;
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function formatValue(value?: string | number | null) {
  return value != null && value !== '' ? value : '-';
}

function Icon({
  type,
  className = 'h-5 w-5',
}: {
  type:
    | 'alert'
    | 'chevron'
    | 'clock'
    | 'feedback'
    | 'mail'
    | 'notes'
    | 'phone'
    | 'pencil'
    | 'restrictions'
    | 'routine'
    | 'session'
    | 'trash';
  className?: string;
}) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {type === 'alert' ? <path d="M12 4 3 20h18L12 4Zm0 6v4m0 3h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'chevron' ? <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'clock' ? <><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M12 8v4l3 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></> : null}
      {type === 'feedback' ? <path d="M5 5h14v10H8l-3 3V5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'mail' ? <path d="M4 6h16v12H4V6Zm0 1 8 6 8-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'notes' ? <path d="M7 4h10v16H7V4Zm3 5h4m-4 4h4m-4 4h2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'phone' ? <path d="M7 4h4l1.2 4-2.4 1.4a11 11 0 0 0 4.8 4.8l1.4-2.4 4 1.2v4a2 2 0 0 1-2.2 2A15.8 15.8 0 0 1 5 6.2 2 2 0 0 1 7 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'pencil' ? <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'restrictions' ? <path d="M12 4 6 6v5c0 4 2.5 7 6 9 3.5-2 6-5 6-9V6l-6-2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'routine' ? <path d="M5 5h14M7 9h10M7 13h7M7 17h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /> : null}
      {type === 'session' ? <path d="M4 13h4l2 6 4-14 2 8h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'trash' ? <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
    </svg>
  );
}

function StatusBadge({ status }: { status: Student['status'] }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black"
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
      <p className="text-xs font-black uppercase text-[#009b4f]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#0f172a]">{formatValue(value)}</p>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[8px] bg-[#f1f4f2] px-4 py-8 text-center text-sm text-[#64748b]">
      {children}
    </p>
  );
}

function SummaryCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'warning';
}) {
  return (
    <article
      className={`rounded-[8px] border px-3 py-3 ${
        tone === 'warning'
          ? 'border-[#fed7aa] bg-[#fff7ed]'
          : 'border-[#e1e7e1] bg-white'
      }`}
    >
      <p className={`text-[11px] font-black uppercase leading-4 ${tone === 'warning' ? 'text-[#c2410c]' : 'text-[#64748b]'}`}>
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-[#0f172a]">{value}</p>
    </article>
  );
}

function TabButton({
  active,
  count,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  icon: Parameters<typeof Icon>[0]['type'];
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-11 shrink-0 items-center gap-2 rounded-[8px] px-4 text-sm font-black transition ${
        active
          ? 'bg-white text-[#087a3d] shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
          : 'text-[#64748b] hover:bg-white/70 hover:text-[#087a3d]'
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" type={icon} />
      {label}
      {count > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#cdeedb] px-1.5 text-xs font-black text-[#087a3d]">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<StudentHistoryEvent[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [feedbacks, setFeedbacks] = useState<TrainingFeedback[]>([]);
  const [discomfortAlerts, setDiscomfortAlerts] = useState<RecurrentDiscomfortAlert[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [historyPage, setHistoryPage] = useState(1);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      try {
        const [studentResponse, historyResponse] = await Promise.all([
          apiFetch<Student>(`/students/${params.id}`),
          apiFetch<StudentHistoryEvent[]>(`/students/${params.id}/history`),
        ]);
        const session = await apiFetch<{ user: LocalUser }>('/auth/session');
        const routineResponse = await apiFetch<Routine[]>(`/routines?studentId=${params.id}`);
        const sessionResponse = await apiFetch<TrainingSession[]>(`/students/${params.id}/training-sessions`);
        const feedbackResponse = await apiFetch<TrainingFeedback[]>(`/students/${params.id}/training-feedback`);
        const discomfortAlertResponse = await apiFetch<RecurrentDiscomfortAlert[]>(`/students/${params.id}/discomfort-alerts`);
        setUser(session.user);
        setStudent(studentResponse);
        setHistory(historyResponse);
        setRoutines(routineResponse);
        setSessions(sessionResponse);
        setFeedbacks(feedbackResponse);
        setDiscomfortAlerts(discomfortAlertResponse);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo cargar el alumno.');
      }
    }

    void loadStudent();
  }, [params.id]);

  const tabCounts = useMemo(() => {
    const profile = student?.profile;
    return {
      alerts: discomfortAlerts.length,
      info: 1,
      restrictions: [
        profile?.previousPhysicalNotes,
        profile?.restrictions,
        profile?.recurrentDiscomforts,
      ].filter(hasText).length,
      observations: hasText(profile?.observations) ? 1 : 0,
      routines: routines.length,
      sessions: sessions.length,
      feedback: feedbacks.length,
      history: history.length,
    } satisfies Record<TabKey, number>;
  }, [discomfortAlerts.length, feedbacks.length, history.length, routines.length, sessions.length, student?.profile]);

  const studentTracking = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentFeedbacks = feedbacks.filter(
      (feedback) => new Date(feedback.submittedAt).getTime() >= last30Days.getTime(),
    );
    const recentCompletedSessions = sessions.filter(
      (session) =>
        session.status === 'COMPLETED' &&
        session.completedAt &&
        new Date(session.completedAt).getTime() >= last30Days.getTime(),
    );
    const discomfortFeedbacks = recentFeedbacks.filter((feedback) => feedback.hadDiscomfort);

    const average = (values: number[]) =>
      values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : null;

    return {
      completedSessionsLast30Days: recentCompletedSessions.length,
      feedbackLast30Days: recentFeedbacks.length,
      discomfortFeedbackLast30Days: discomfortFeedbacks.length,
      averageDifficulty: average(recentFeedbacks.map((feedback) => feedback.difficultyScore)),
      averageEnergy: average(recentFeedbacks.map((feedback) => feedback.energyScore)),
      lastFeedbackAt: feedbacks.length
        ? feedbacks
            .slice()
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
            .submittedAt
        : null,
    };
  }, [feedbacks, sessions]);

  const historyPageSize = 5;
  const totalHistoryPages = Math.max(1, Math.ceil(history.length / historyPageSize));
  const paginatedHistory = history.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize,
  );

  useEffect(() => {
    setHistoryPage(1);
  }, [history.length]);

  async function deleteStudent() {
    if (!student) return;

    setDeleting(true);
    setError('');

    try {
      await apiFetch(`/students/${student.id}`, { method: 'DELETE' });
      router.push('/students');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el alumno.');
      setDeleting(false);
    }
  }

  if (error && !student) {
    return (
      <>
        <div className="mb-6 flex items-center gap-2 text-sm text-[#64748b]">
          <Link className="hover:text-[#087a3d]" href="/students">Alumnos</Link>
          <Icon className="h-4 w-4" type="chevron" />
          <span>Detalle</span>
        </div>
        <p className="rounded-[8px] border border-[#b3261e]/30 bg-white px-5 py-4 text-sm text-[#b3261e]">{error}</p>
      </>
    );
  }

  if (!student) {
    return <p className="rounded-[12px] border border-[#e5e7eb] bg-white p-8 text-sm text-[#64748b]">Cargando alumno...</p>;
  }

  const contactLine = student.email ?? student.phone ?? 'Sin contacto';
  const fullName = `${student.firstName} ${student.lastName}`;

  const tabs: Array<{ key: TabKey; label: string; icon: Parameters<typeof Icon>[0]['type'] }> = [
    { key: 'info', label: 'Perfil', icon: 'notes' },
    { key: 'alerts', label: 'Alertas', icon: 'alert' },
    { key: 'restrictions', label: 'Restricciones', icon: 'restrictions' },
    { key: 'observations', label: 'Observaciones', icon: 'notes' },
    { key: 'routines', label: 'Rutinas', icon: 'routine' },
    { key: 'sessions', label: 'Entrenamientos', icon: 'session' },
    { key: 'feedback', label: 'Feedback', icon: 'feedback' },
    { key: 'history', label: 'Historial', icon: 'clock' },
  ];

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/students">Alumnos</Link>
        <Icon className="h-4 w-4" type="chevron" />
        <span className="font-semibold text-[#0f172a]">{fullName}</span>
      </div>

      <section className="overflow-hidden rounded-[14px] border border-[#e1e7e1] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#edf1ee] px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ddd6fe] text-lg font-black text-[#5b4bb7]">
              {(student.firstName[0] ?? '').toUpperCase()}{(student.lastName[0] ?? '').toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a]">{fullName}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#64748b]">
                <Icon className="h-4 w-4" type={student.email ? 'mail' : 'phone'} />
                {contactLine}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={student.status} />
            <Link
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#087a3d] transition hover:bg-[#f0fdf4]"
              href={`/students/edit/${student.id}`}
              title="Editar"
            >
              <Icon className="h-4 w-4" type="pencil" />
            </Link>
            {confirmDelete ? (
              <>
                <button
                  className="flex h-9 items-center rounded-[8px] bg-[#dc2626] px-3 text-xs font-semibold text-white disabled:opacity-60"
                  disabled={deleting}
                  onClick={deleteStudent}
                  type="button"
                >
                  {deleting ? 'Eliminando...' : 'Confirmar'}
                </button>
                <button
                  className="flex h-9 items-center rounded-[8px] border border-[#e5e7eb] px-3 text-xs font-semibold text-[#64748b] hover:bg-[#f8fafc]"
                  onClick={() => setConfirmDelete(false)}
                  type="button"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#dc2626] transition hover:bg-[#fef2f2]"
                onClick={() => setConfirmDelete(true)}
                title="Eliminar"
                type="button"
              >
                <Icon className="h-4 w-4" type="trash" />
              </button>
            )}
          </div>
        </div>

        {error ? <p className="mx-6 mt-4 text-sm text-[#dc2626]">{error}</p> : null}
      </section>

      <section className="mt-5 rounded-[10px] border border-[#e1e7e1] bg-[#f8faf9] px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#0f172a]">Seguimiento del alumno</h2>
            <p className="mt-1 text-xs text-[#64748b]">Resumen de entrenamiento y feedback de los ultimos 30 dias.</p>
          </div>
          {studentTracking.lastFeedbackAt ? (
            <span className="text-xs font-semibold text-[#64748b]">
              Ultimo feedback: {new Date(studentTracking.lastFeedbackAt).toLocaleDateString('es-AR')}
            </span>
          ) : null}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Sesiones completadas" value={studentTracking.completedSessionsLast30Days} />
          <SummaryCard label="Feedbacks recibidos" value={studentTracking.feedbackLast30Days} />
          <SummaryCard
            label="Dificultad promedio"
            value={studentTracking.averageDifficulty != null ? `${studentTracking.averageDifficulty}/10` : '-'}
          />
          <SummaryCard
            label="Energia promedio"
            value={studentTracking.averageEnergy != null ? `${studentTracking.averageEnergy}/10` : '-'}
          />
          <SummaryCard
            label="Feedback con molestias"
            tone={studentTracking.discomfortFeedbackLast30Days ? 'warning' : 'neutral'}
            value={studentTracking.discomfortFeedbackLast30Days}
          />
        </div>
      </section>

      <div className="mt-5">
          <section className="overflow-hidden rounded-[14px] border border-[#e1e7e1] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto bg-[#f3f6f4] p-2">
              <div className="flex min-w-max gap-2">
                {tabs.map((tab) => (
                  <TabButton
                    active={activeTab === tab.key}
                    count={tabCounts[tab.key]}
                    icon={tab.icon}
                    key={tab.key}
                    label={tab.label}
                    onClick={() => setActiveTab(tab.key)}
                  />
                ))}
              </div>
            </div>

            <div className="px-6 py-6">
              {activeTab === 'info' ? (
                <div className="space-y-8">
                  <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoItem label="Nombre" value={fullName} />
                    <InfoItem label="Email" value={student.email} />
                    <InfoItem label="Telefono" value={student.phone} />
                    <InfoItem label="Estado" value={statusConfig[student.status].label} />
                    <InfoItem label="Objetivo" value={student.profile?.goal ? (goalLabels[student.profile.goal] ?? student.profile.goal) : null} />
                    <InfoItem label="Experiencia" value={student.profile?.experience} />
                    <InfoItem label="Creado" value={new Date(student.createdAt).toLocaleDateString('es-AR')} />
                  </div>
                  <div className="border-t border-[#edf1ee] pt-6">
                    <h2 className="text-lg font-black text-[#0f172a]">Perfil deportivo</h2>
                    <div className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Objetivo" value={student.profile?.goal ? (goalLabels[student.profile.goal] ?? student.profile.goal) : null} />
                    <InfoItem label="Experiencia" value={student.profile?.experience} />
                    <InfoItem label="Edad" value={student.profile?.age != null ? `${student.profile.age} anos` : null} />
                    <InfoItem label="Peso" value={student.profile?.weightKg != null ? `${student.profile.weightKg} kg` : null} />
                    <InfoItem label="Altura" value={student.profile?.heightCm != null ? `${student.profile.heightCm} cm` : null} />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'alerts' ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#64748b]">
                    Molestias reportadas 3 o mas veces en los ultimos 30 dias. No es diagnostico medico.
                  </p>
                  {discomfortAlerts.length ? (
                    <div className="space-y-3">
                      {discomfortAlerts.map((alert) => (
                        <article className="rounded-[8px] border border-[#fecaca] bg-[#fff7f7] px-4 py-4" key={alert.areaKey}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black uppercase text-[#b3261e]">Molestia recurrente</p>
                              <h3 className="mt-1 text-lg font-black text-[#7f1d1d]">{alert.area}</h3>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#b3261e]">
                              {alert.reportCount} reportes
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 text-sm text-[#7f1d1d] sm:grid-cols-3">
                            <p><span className="font-black">Promedio:</span> {alert.averageIntensity != null ? `${alert.averageIntensity}/10` : '-'}</p>
                            <p><span className="font-black">Maxima:</span> {alert.maxIntensity != null ? `${alert.maxIntensity}/10` : '-'}</p>
                            <p><span className="font-black">Ultima:</span> {new Date(alert.lastReportedAt).toLocaleDateString('es-AR')}</p>
                          </div>
                          {alert.recentComments.length ? (
                            <div className="mt-4 space-y-2">
                              {alert.recentComments.map((comment, index) => (
                                <p className="rounded-[8px] bg-white px-3 py-2 text-sm text-[#7f1d1d]" key={`${alert.areaKey}-${index}`}>
                                  {comment}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>No hay molestias recurrentes activas en los ultimos 30 dias.</EmptyState>
                  )}
                </div>
              ) : null}

              {activeTab === 'restrictions' ? (
                <div className="grid gap-5">
                  <InfoItem label="Antecedentes fisicos relevantes" value={student.profile?.previousPhysicalNotes} />
                  <InfoItem label="Restricciones para entrenar" value={student.profile?.restrictions} />
                  <InfoItem label="Molestias recurrentes reportadas" value={student.profile?.recurrentDiscomforts} />
                  {!tabCounts.restrictions ? <EmptyState>No hay restricciones cargadas.</EmptyState> : null}
                </div>
              ) : null}

              {activeTab === 'observations' ? (
                <div className="grid gap-5">
                  <InfoItem label="Observaciones del entrenador" value={student.profile?.observations} />
                  {!tabCounts.observations ? <EmptyState>No hay observaciones cargadas.</EmptyState> : null}
                </div>
              ) : null}

              {activeTab === 'routines' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#64748b]">Activas, borradores y archivadas asociadas a este alumno.</p>
                    {user?.role === 'TRAINER' ? (
                      <Link className="rounded-[8px] bg-[#087a3d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#076b36]" href={`/routines/new?studentId=${student.id}`}>
                        Crear rutina
                      </Link>
                    ) : null}
                  </div>
                  {routines.length ? (
                    <div className="space-y-3">
                      {routines.map((routine) => (
                        <Link
                          className="flex min-h-14 flex-col gap-2 rounded-[8px] border border-[#e5e7eb] px-3 py-3 transition hover:border-[#b8dec7] hover:bg-[#f8faf9] sm:flex-row sm:items-center sm:justify-between"
                          href={`/routines/${routine.id}`}
                          key={routine.id}
                        >
                          <div>
                            <p className="text-sm font-black text-[#0f172a]">{routine.name}</p>
                            <p className="mt-0.5 text-xs text-[#64748b]">{routine.days.length} dias · version {routine.version}</p>
                          </div>
                          <span className="w-fit rounded-full bg-[#eaf6ef] px-2.5 py-0.5 text-xs font-black text-[#087a3d]">
                            {routineStatusLabels[routine.status]}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>Todavia no hay rutinas para este alumno.</EmptyState>
                  )}
                </div>
              ) : null}

              {activeTab === 'sessions' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#64748b]">Sesiones recientes registradas a partir de rutinas publicadas.</p>
                    {user?.role === 'TRAINER' ? (
                      <Link className="rounded-[8px] bg-[#087a3d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#076b36]" href={`/training-sessions/new?studentId=${student.id}`}>
                        Crear sesion
                      </Link>
                    ) : null}
                  </div>
                  {sessions.length ? (
                    <div className="space-y-3">
                      {sessions.map((trainingSession) => (
                        <Link
                          className="flex min-h-14 flex-col gap-2 rounded-[8px] border border-[#e5e7eb] px-3 py-3 transition hover:border-[#b8dec7] hover:bg-[#f8faf9] sm:flex-row sm:items-center sm:justify-between"
                          href={`/training-sessions/${trainingSession.id}`}
                          key={trainingSession.id}
                        >
                          <div>
                            <p className="text-sm font-black text-[#0f172a]">{trainingSession.routine.name}</p>
                            <p className="mt-0.5 text-xs text-[#64748b]">
                              {trainingSession.scheduledDate
                                ? new Date(trainingSession.scheduledDate).toLocaleDateString('es-AR')
                                : 'Sin fecha programada'}
                            </p>
                          </div>
                          <span className="w-fit rounded-full bg-[#eaf6ef] px-2.5 py-0.5 text-xs font-black text-[#087a3d]">
                            {sessionStatusLabels[trainingSession.status]}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>Todavia no hay entrenamientos registrados para este alumno.</EmptyState>
                  )}
                </div>
              ) : null}

              {activeTab === 'feedback' ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#64748b]">Feedback enviado por el alumno al finalizar sus entrenamientos.</p>
                  {feedbacks.length ? (
                    <div className="space-y-3">
                      {feedbacks.map((feedback) => (
                        <Link
                          className="block rounded-[8px] border border-[#e5e7eb] px-3 py-3 transition hover:border-[#b8dec7] hover:bg-[#f8faf9]"
                          href={`/training-sessions/${feedback.trainingSessionId}#${feedback.trainingSessionDayId}`}
                          key={feedback.id}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-black text-[#0f172a]">{feedback.routine.name} · {feedback.day.name}</p>
                            <p className="text-xs text-[#64748b]">{new Date(feedback.submittedAt).toLocaleDateString('es-AR')}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-black text-[#334155]">Dificultad {feedback.difficultyScore}/10</span>
                            <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-black text-[#334155]">Energia {feedback.energyScore}/10</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${feedback.completedWorkout ? 'bg-[#eaf6ef] text-[#087a3d]' : 'bg-[#fff7ed] text-[#c2410c]'}`}>
                              {feedback.completedWorkout ? 'Completo' : 'No completo'}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${feedback.hadDiscomfort ? 'bg-[#fef2f2] text-[#b3261e]' : 'bg-[#f1f5f9] text-[#334155]'}`}>
                              {feedback.hadDiscomfort ? `Molestia${feedback.discomfortArea ? `: ${feedback.discomfortArea}` : ''}${feedback.discomfortIntensity ? ` (${feedback.discomfortIntensity}/10)` : ''}` : 'Sin molestia'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>Todavia no hay feedback enviado por este alumno.</EmptyState>
                  )}
                </div>
              ) : null}

              {activeTab === 'history' ? (
                <div className="space-y-5">
                  {paginatedHistory.length ? (
                    <>
                      <div className="space-y-5">
                        {paginatedHistory.map((event) => {
                          const sessionLink = eventSessionLink(event.metadata);
                          return (
                            <div className="border-l-2 border-[#22c55e] pl-4" key={event.id}>
                              <p className="text-sm font-black text-[#1e293b]">{historyLabels[event.type] ?? event.type}</p>
                              <p className="mt-1 text-sm text-[#64748b]">{event.summary}</p>
                              <p className="mt-1 text-xs text-[#94a3b8]">{new Date(event.createdAt).toLocaleString('es-AR')}</p>
                              {sessionLink ? (
                                <Link className="mt-1 inline-block text-xs font-black text-[#087a3d] hover:underline" href={sessionLink}>
                                  Ver sesion
                                </Link>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ee] pt-4">
                        <p className="text-sm font-semibold text-[#64748b]">
                          Pagina {historyPage} de {totalHistoryPages}
                        </p>
                        <div className="flex gap-2">
                          <button
                            className="h-9 rounded-[8px] border border-[#d8dee6] px-4 text-sm font-black text-[#334155] transition hover:bg-[#f8faf9] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={historyPage === 1}
                            onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                            type="button"
                          >
                            Anterior
                          </button>
                          <button
                            className="h-9 rounded-[8px] border border-[#d8dee6] px-4 text-sm font-black text-[#334155] transition hover:bg-[#f8faf9] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={historyPage === totalHistoryPages}
                            onClick={() => setHistoryPage((page) => Math.min(totalHistoryPages, page + 1))}
                            type="button"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <EmptyState>Sin eventos todavia.</EmptyState>
                  )}
                </div>
              ) : null}
            </div>
          </section>
      </div>
    </>
  );
}
