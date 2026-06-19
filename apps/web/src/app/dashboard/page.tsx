'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { apiFetch, DashboardMetrics, LocalUser } from '@/lib/api';

function Icon({
  type,
  className = 'h-6 w-6',
}: {
  type: 'users' | 'clipboard' | 'chart' | 'calendar' | 'shield' | 'arrow' | 'check';
  className?: string;
}) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {type === 'users' ? <><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="M16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="M3.5 19a4.5 4.5 0 0 1 9 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="M13.5 18.5a3.5 3.5 0 0 1 7 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></> : null}
      {type === 'clipboard' ? <><path d="M9 4h6l1 2h3v14H5V6h3l1-2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /><path d="M9 13l2 2 4-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></> : null}
      {type === 'chart' ? <><path d="M4 19h16M6 17l4.2-4.2 3 3L19 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="M15.5 9H19v3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></> : null}
      {type === 'calendar' ? <><path d="M7 3v3M17 3v3M4.5 8h15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /></> : null}
      {type === 'shield' ? <><path d="M12 3 19 6v5c0 4.4-2.8 8.3-7 9.7C7.8 19.3 5 15.4 5 11V6l7-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /><path d="m9 12 2 2 4-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></> : null}
      {type === 'arrow' ? <path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'check' ? <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
    </svg>
  );
}

function Badge({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'dark' }) {
  return (
    <span
      className={`inline-flex h-9 items-center rounded-[8px] px-3 text-sm font-black uppercase ${
        tone === 'green'
          ? 'bg-[#e2f4df] text-[#087a3d]'
          : 'bg-[#e7f1ed] text-[#164032]'
      }`}
    >
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  href,
  cta,
  icon,
  tone = 'green',
}: {
  label: string;
  value: number | null;
  href: string;
  cta: string;
  icon: 'users' | 'clipboard' | 'chart' | 'calendar' | 'shield';
  tone?: 'green' | 'orange';
}) {
  const iconTone =
    tone === 'orange'
      ? 'bg-[#fff0df] text-[#f97316]'
      : 'bg-[#e2f4df] text-[#0b8a3d]';

  return (
    <Link className="block h-full" href={href}>
      <article className="flex min-h-[170px] rounded-[12px] border border-[#e1e7e1] bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(8,122,61,0.12)]">
        <div className="flex w-full items-center gap-5">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
            <Icon className="h-9 w-9" type={icon} />
          </div>
          <div className="flex min-h-[122px] min-w-0 flex-1 flex-col justify-center">
            <p className="min-h-10 text-sm leading-5 text-[#4b5563]">{label}</p>
            <p className="mt-2 text-4xl font-black text-[#111827]">
              {value === null ? '--' : value}
            </p>
            <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-black text-[#087a3d]">
              {cta}
              <Icon className="h-4 w-4" type="arrow" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ActionPanel({
  title,
  text,
  href,
  cta,
  variant = 'green',
  children,
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
  variant?: 'green' | 'orange';
  children: ReactNode;
}) {
  const isOrange = variant === 'orange';

  return (
    <article className={`flex min-h-[330px] overflow-hidden rounded-[12px] border border-[#e1e7e1] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)] ${isOrange ? 'bg-[linear-gradient(135deg,#fffaf5_0%,#ffffff_62%)]' : ''}`}>
      <div className="grid w-full gap-6 p-6 sm:p-8 md:grid-cols-[1fr_220px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black tracking-[-0.02em] text-[#111827]">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-[#4b5563]">{text}</p>
          <Link className="mt-auto inline-flex h-14 w-fit items-center gap-4 rounded-[8px] bg-[#087a3d] px-6 text-base font-black text-white shadow-[0_18px_36px_rgba(8,122,61,0.18)] transition hover:bg-[#0a8d48]" href={href}>
            {cta}
            <Icon className="h-5 w-5" type="arrow" />
          </Link>
        </div>
        <div className="hidden items-center justify-center md:flex">{children}</div>
      </div>
    </article>
  );
}

function StudentsIllustration() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((item) => (
        <div className="h-20 w-24 rounded-[8px] border border-[#e2e8e2] bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]" key={item}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#b9dfb5]" />
            <div className="space-y-2">
              <div className="h-2 w-9 rounded-full bg-[#dbeadd]" />
              <div className="h-2 w-6 rounded-full bg-[#dbeadd]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminIllustration() {
  return (
    <div className="relative h-44 w-44">
      <div className="absolute inset-0 rounded-[18px] bg-[#fff0df]" />
      <div className="absolute left-8 top-8 h-28 w-28 rounded-[12px] bg-white p-5 shadow-[0_18px_36px_rgba(249,115,22,0.12)]">
        <div className="h-9 w-9 rounded-full border-4 border-[#f97316]" />
        <div className="mt-4 h-3 w-16 rounded-full bg-[#ffd9b5]" />
        <div className="mt-2 h-3 w-11 rounded-full bg-[#ffd9b5]" />
      </div>
      <div className="absolute bottom-6 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fb923c] text-white">
        <Icon className="h-6 w-6" type="check" />
      </div>
    </div>
  );
}

function ChecklistPanel({ admin }: { admin: boolean }) {
  const items = admin
    ? ['Revisa solicitudes pendientes', 'Activa entrenadores aprobados', 'Consulta alumnos registrados', 'Monitorea crecimiento mensual']
    : ['Agrega tu primer alumno', 'Completa el perfil deportivo', 'Consulta su historial inicial', 'Prepara el seguimiento mensual'];

  return (
    <article className="flex min-h-[330px] flex-col rounded-[12px] border border-[#e1e7e1] bg-[linear-gradient(135deg,#f8fff4_0%,#ffffff_68%)] p-8 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
      <h2 className="text-2xl font-black tracking-[-0.02em] text-[#111827]">
        {admin ? 'Comenza desde administracion' : 'Comenza desde aca'}
      </h2>
      <div className="mt-7 grid flex-1 content-center gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div className="flex items-center gap-3 text-base text-[#1f2937]" key={item}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0b8a3d] text-[#0b8a3d]">
              <Icon className="h-4 w-4" type="check" />
            </span>
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}

function BottomBanner({ admin }: { admin: boolean }) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-[#e1e7e1] bg-[linear-gradient(135deg,#0b6f3a_0%,#0f8f49_56%,#f97316_100%)] p-6 text-white shadow-[0_24px_58px_rgba(8,122,61,0.2)] sm:p-8">
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-white/15">
            <Icon className="h-7 w-7" type={admin ? 'shield' : 'chart'} />
          </div>
          <h2 className="mt-6 text-2xl font-black tracking-[-0.02em] sm:text-3xl">
            {admin ? 'Gestion centralizada del gimnasio' : 'Seguimiento simple para tus alumnos'}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/86">
            {admin
              ? 'Administra entrenadores, revisa solicitudes y consulta el estado general desde una vista clara, sin duplicar pantallas por estado.'
              : 'Consulta alumnos activos, revisa sus perfiles y mantene el control de tu cartera desde el dashboard.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[10px] bg-white/16 p-4">
            <p className="text-sm font-semibold text-white/72">Vista</p>
            <p className="mt-2 text-lg font-black">{admin ? 'Admin' : 'Trainer'}</p>
          </div>
          <div className="rounded-[10px] bg-white/16 p-4">
            <p className="text-sm font-semibold text-white/72">Estado</p>
            <p className="mt-2 text-lg font-black">Activo</p>
          </div>
          <div className="col-span-2 rounded-[10px] bg-white/16 p-4">
            <p className="text-sm font-semibold text-white/72">Acceso rapido</p>
            <p className="mt-2 text-lg font-black">{admin ? 'Entrenadores y alumnos' : 'Alumnos y catalogo'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [sessionResponse, metricsResponse] = await Promise.all([
          apiFetch<{ user: LocalUser }>('/auth/session'),
          apiFetch<DashboardMetrics>('/dashboard/metrics'),
        ]);
        setUser(sessionResponse.user);
        setMetrics(metricsResponse);
      } catch {
        router.push('/access-status');
      }
    }

    void loadDashboard();
  }, [router]);

  if (!user) {
    return (
      <div className="rounded-[12px] border border-[#e1e7e1] bg-white p-8 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
        <p className="text-sm text-[#6b7280]">Cargando dashboard...</p>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';
  const titleName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-black tracking-[-0.03em] text-[#111827] sm:text-4xl">
          Bienvenido de vuelta, {titleName}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#4b5563]">
          {isAdmin
            ? 'Resumen operativo para administrar entrenadores, alumnos y solicitudes.'
            : 'Resumen de tu actividad para gestionar alumnos y seguimiento.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-base text-[#4b5563]">
          <span>Rol:</span>
          <Badge tone="dark">{user.role}</Badge>
          <span className="text-[#9ca3af]">-</span>
          <span>Estado:</span>
          <Badge>{user.status}</Badge>
        </div>
      </section>

      {isAdmin ? (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard cta="Ver pendientes" href="/entrenadores?status=PENDING_APPROVAL" icon="users" label="Entrenadores pendientes" tone="orange" value={metrics?.role === 'ADMIN' ? metrics.pendingTrainers : null} />
            <MetricCard cta="Ver activos" href="/entrenadores?status=ACTIVE" icon="shield" label="Entrenadores activos" value={metrics?.role === 'ADMIN' ? metrics.activeTrainers : null} />
            <MetricCard cta="Ver comunidad" href="/entrenadores" icon="users" label="Total entrenadores" value={metrics?.role === 'ADMIN' ? metrics.totalTrainers : null} />
            <MetricCard cta="Ver alumnos" href="/students" icon="users" label="Total alumnos" value={metrics?.role === 'ADMIN' ? metrics.totalStudents : null} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ActionPanel cta="Ver entrenadores" href="/entrenadores?status=PENDING_APPROVAL" text="Revisa y aproba solicitudes de entrenadores que quieren unirse a tu gimnasio." title="Administracion" variant="orange">
              <AdminIllustration />
            </ActionPanel>
            <ActionPanel cta="Ver alumnos" href="/students" text="Consulta perfiles deportivos, historial inicial y progreso de los alumnos." title="Alumnos">
              <StudentsIllustration />
            </ActionPanel>
          </section>

          <ChecklistPanel admin />
          <BottomBanner admin />
        </>
      ) : (
        <>
          <section className="grid gap-5 lg:grid-cols-2">
            <MetricCard cta="Ver todos" href="/students" icon="users" label="Alumnos activos" value={metrics?.role === 'TRAINER' ? metrics.activeStudents : null} />
            <MetricCard cta="Ver alumnos" href="/students" icon="chart" label="Total de alumnos" value={metrics?.role === 'TRAINER' ? metrics.totalStudents : null} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <ActionPanel cta="Ver alumnos" href="/students" text="Gestiona tus alumnos, revisa su progreso y prepara sus proximos pasos." title="Mis alumnos">
              <StudentsIllustration />
            </ActionPanel>
            <ChecklistPanel admin={false} />
          </section>

          <BottomBanner admin={false} />
        </>
      )}
    </div>
  );
}
