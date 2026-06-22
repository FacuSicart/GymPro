'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { apiFetch, LocalUser, logout } from '@/lib/api';

const shellPaths = ['/dashboard', '/entrenadores', '/students', '/exercises', '/routines', '/routine-templates', '/training-sessions'];

function Icon({
  type,
  className = 'h-5 w-5',
}: {
  type: 'home' | 'user' | 'users' | 'clipboard' | 'calendar' | 'activity' | 'logout' | 'bell' | 'chevron';
  className?: string;
}) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {type === 'home' ? <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'user' ? <><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></> : null}
      {type === 'users' ? <><path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" /><path d="M17 10a3 3 0 1 0 0-6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /><path d="M3 20a6 6 0 0 1 12 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></> : null}
      {type === 'clipboard' ? <><path d="M9 4h6l1 2h3v14H5V6h3l1-2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /><path d="M9 13l2 2 4-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></> : null}
      {type === 'calendar' ? <><path d="M7 3v4m10-4v4M4 8h16v12H4V8Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="M8 12h3m-3 4h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></> : null}
      {type === 'activity' ? <path d="M3 12h4l2 7 4-14 2 7h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
      {type === 'logout' ? <><path d="M14 8V5H5v14h9v-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><path d="M11 12h9m0 0-3-3m3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></> : null}
      {type === 'bell' ? <><path d="M18 16H6c1-1.2 1.5-2.8 1.5-4.5V10a4.5 4.5 0 0 1 9 0v1.5c0 1.7.5 3.3 1.5 4.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /><path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></> : null}
      {type === 'chevron' ? <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /> : null}
    </svg>
  );
}

function LogoImage({ compact = false }: { compact?: boolean }) {
  return (
    <img
      alt="PROGYM"
      className={compact ? 'h-16 w-auto object-contain' : 'h-24 w-auto object-contain'}
      src="/progym-dashboard-logo.png"
    />
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const useShell = shellPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    if (!useShell) return;

    async function loadSession() {
      try {
        const response = await apiFetch<{ user: LocalUser }>('/auth/session');
        setUser(response.user);
      } catch {
        router.push('/access-status');
      }
    }

    void loadSession();
  }, [router, useShell]);

  if (!useShell) {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' as const, adminOnly: false },
    { label: 'Entrenadores', href: '/entrenadores', icon: 'user' as const, adminOnly: true },
    { label: 'Alumnos', href: '/students', icon: 'users' as const, adminOnly: false },
    { label: 'Catalogo', href: '/exercises', icon: 'clipboard' as const, adminOnly: false },
    { label: 'Rutinas', href: '/routines', icon: 'calendar' as const, adminOnly: false },
    { label: 'Plantillas', href: '/routine-templates', icon: 'clipboard' as const, adminOnly: false },
  ].filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  async function signOut() {
    await logout().catch(() => null);
    router.push('/login');
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#111827]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[290px] shrink-0 border-r border-[#e2e8e2] bg-white px-6 py-9 lg:flex lg:flex-col">
          <Link className="flex w-fit items-center" href="/dashboard" aria-label="Ir al dashboard">
            <LogoImage />
          </Link>

          <nav className="mt-10 space-y-3">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  className={`flex h-14 items-center gap-4 rounded-[8px] px-3 text-base font-semibold transition ${
                    active
                      ? 'bg-[#eaf6ef] text-[#087a3d]'
                      : 'text-[#475569] hover:bg-[#f2f7f3] hover:text-[#087a3d]'
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon type={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#e5e7eb] pt-8" />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-[102px] items-center justify-between border-b border-[#e2e8e2] bg-white px-5 sm:px-8 lg:px-11">
            <Link className="flex w-fit items-center lg:hidden" href="/dashboard" aria-label="Ir al dashboard">
              <LogoImage compact />
            </Link>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-5">
              <button className="hidden h-11 w-11 items-center justify-center rounded-full text-[#334155] sm:flex" type="button">
                <Icon type="bell" />
              </button>
              <div className="h-10 w-px bg-[#e2e8e2]" />
              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center gap-4 rounded-[8px] px-2 py-1.5 transition hover:bg-[#f2f7f3]"
                    onClick={() => setProfileOpen((open) => !open)}
                    type="button"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#087a3d] text-sm font-black text-white">
                      {`${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-black text-[#111827]">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-[#475569]">
                        {user.role === 'ADMIN' ? 'Administrador' : 'Entrenador'}
                      </p>
                    </div>
                    <Icon className={`h-4 w-4 rotate-90 text-[#475569] transition ${profileOpen ? 'rotate-[270deg]' : ''}`} type="chevron" />
                  </button>

                  {profileOpen ? (
                    <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-64 rounded-[12px] border border-[#e1e7e1] bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                      <div className="border-b border-[#e5e7eb] px-3 py-3">
                        <p className="text-sm font-black text-[#111827]">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="mt-1 text-xs text-[#6b7280]">{user.email}</p>
                      </div>
                      <button
                        className="mt-2 flex h-11 w-full items-center gap-3 rounded-[8px] px-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f2f7f3] hover:text-[#076b36]"
                        onClick={signOut}
                        type="button"
                      >
                        <Icon className="h-5 w-5" type="logout" />
                        Cerrar sesion
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </header>

          <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-11">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
