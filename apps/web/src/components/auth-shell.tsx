import Link from 'next/link';
import { ReactNode } from 'react';

function LogoImage() {
  return (
    <img
      alt="PROGYM"
      className="h-32 w-auto object-contain sm:h-40 lg:h-48"
      src="/progym-login-logo.png"
    />
  );
}

function FeatureIcon({ type }: { type: 'users' | 'plan' | 'chart' }) {
  const common = 'stroke-current';

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] border border-[#78df35] bg-[#78df35]/5 text-[#78df35]">
      {type === 'users' ? (
        <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
          <path className={common} d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path className={common} d="M16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path className={common} d="M3.5 19a4.5 4.5 0 0 1 9 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path className={common} d="M13.5 18.5a3.5 3.5 0 0 1 7 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      ) : null}
      {type === 'plan' ? (
        <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
          <path className={common} d="M7 3v3M17 3v3M4.5 8h15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path className={common} d="M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" strokeLinejoin="round" strokeWidth="1.8" />
          <path className={common} d="m8 14 2.2 2.2L16 11" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      ) : null}
      {type === 'chart' ? (
        <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
          <path className={common} d="M4 19h16M6 17l4.2-4.2 3 3L19 9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path className={common} d="M15.5 9H19v3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      ) : null}
    </div>
  );
}

function FeatureItem({
  title,
  text,
  type,
}: {
  title: string;
  text: string;
  type: 'users' | 'plan' | 'chart';
}) {
  return (
    <div className="flex items-center gap-5">
      <FeatureIcon type={type} />
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#c7ced7]">{text}</p>
      </div>
    </div>
  );
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05080b] text-white">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,11,0.98)_0%,rgba(5,8,11,0.9)_34%,rgba(10,15,20,0.78)_58%,rgba(5,8,11,0.96)_100%)]" />
        <div className="absolute inset-y-0 left-[32%] hidden w-[34%] bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.06)_52%,rgba(255,255,255,0)_100%)] opacity-40 lg:block" />
        <div className="absolute bottom-0 left-[35%] hidden h-[82vh] w-[30vw] max-w-[440px] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_28%,rgba(0,0,0,0)_76%)] opacity-35 blur-xl lg:block" />

        <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_540px] lg:px-14">
          <section className="py-6 lg:py-12">
            <Link className="inline-flex w-fit items-center" href="/login" aria-label="Ir al login">
              <LogoImage />
            </Link>

            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#78df35]">
                {eyebrow}
              </p>
              <h1 className="mt-5 text-3xl font-black leading-[1.12] sm:text-4xl lg:text-5xl">
                Plataforma inteligente{' '}
                <span className="block text-[#78df35]">para entrenadores</span>
                <span className="block text-[#78df35]">y gimnasios</span>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-9 text-[#d9dde3]">
                Gestiona tus alumnos, crea rutinas personalizadas y acompana el
                progreso de manera simple y profesional.
              </p>
            </div>

            <div className="mt-12 hidden max-w-xl space-y-8 md:block">
              <FeatureItem
                text="Toda tu operacion en un solo lugar"
                title="Gestion de alumnos"
                type="users"
              />
              <FeatureItem
                text="Crea rutinas adaptadas en minutos"
                title="Rutinas inteligentes"
                type="plan"
              />
              <FeatureItem
                text="Analiza progreso, adherencia y estado de cuenta"
                title="Seguimiento de resultados"
                type="chart"
              />
            </div>
          </section>

          <section className="w-full rounded-[24px] border border-white/16 bg-[#10161c]/82 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-9 lg:p-12">
            <div className="mb-9">
              <h2 className="text-3xl font-black tracking-[-0.01em] sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 text-base text-[#c7ced7]">{subtitle}</p>
            </div>
            {children}
            <div className="mt-9 flex items-center justify-center gap-3 text-sm text-[#c7ced7]">
              <span className="flex h-6 w-6 items-center justify-center text-[#d9dde3]">
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path d="M12 3 19 6v5c0 4.4-2.8 8.3-7 9.7C7.8 19.3 5 15.4 5 11V6l7-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                  <path d="m9 12 2 2 4-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                </svg>
              </span>
              Acceso seguro y protegido
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
