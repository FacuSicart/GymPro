'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { AuthProfile, getProfile, logout } from '@/lib/api';

const labels = {
  PENDING_APPROVAL: 'Pendiente de aprobacion',
  REJECTED: 'Solicitud rechazada',
  SUSPENDED: 'Cuenta suspendida',
  DEACTIVATED: 'Cuenta desactivada',
  ACTIVE: 'Activa',
};

export default function AccessStatusPage() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(await getProfile());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo leer la cuenta.');
      }
    }

    void loadProfile();
  }, []);

  async function signOut() {
    await logout().catch(() => null);
    window.location.href = '/login';
  }

  const user = profile?.user;

  return (
    <AuthShell
      eyebrow="Estado de cuenta"
      subtitle="Revisa el estado de tu solicitud"
      title="Acceso pendiente"
    >
      <div className="space-y-6">
        {error ? (
          <p className="rounded-[8px] border border-[#ff7a70]/30 bg-[#ff7a70]/10 px-4 py-3 text-sm text-[#ffb4ab]">
            {error}
          </p>
        ) : null}

        {!error && !profile ? (
          <div className="rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-5 py-5">
            <p className="text-sm font-semibold text-[#eef2f6]">Cargando...</p>
            <p className="mt-2 text-sm leading-6 text-[#c7ced7]">
              Estamos consultando el estado de tu cuenta.
            </p>
          </div>
        ) : null}

        {profile && !user ? (
          <div className="rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-5 py-5">
            <p className="text-base font-black text-white">Sesion sin usuario local</p>
            <p className="mt-3 text-sm leading-6 text-[#c7ced7]">
              No hay un usuario local asociado a esta sesion.
            </p>
          </div>
        ) : null}

        {user ? (
          <div className="rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-5 py-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border border-[#78df35] bg-[#78df35]/10 text-[#78df35]">
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path d="M12 3 19 6v5c0 4.4-2.8 8.3-7 9.7C7.8 19.3 5 15.4 5 11V6l7-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                  <path d="m9 12 2 2 4-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#78df35]">
                  {labels[user.status]}
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {user.firstName} {user.lastName}
                </h3>
                {user.status === 'PENDING_APPROVAL' ? (
                  <p className="mt-3 text-sm leading-6 text-[#c7ced7]">
                    Un administrador debe aprobar tu cuenta antes de acceder al dashboard.
                  </p>
                ) : null}
                {user.status === 'REJECTED' ? (
                  <p className="mt-3 text-sm leading-6 text-[#c7ced7]">
                    {user.rejectionReason || 'La solicitud fue rechazada por un administrador.'}
                  </p>
                ) : null}
                {user.status !== 'PENDING_APPROVAL' && user.status !== 'REJECTED' ? (
                  <p className="mt-3 text-sm leading-6 text-[#c7ced7]">
                    Tu cuenta se encuentra en estado {labels[user.status].toLowerCase()}.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {user?.status === 'ACTIVE' ? (
          <Link
            className="flex h-16 w-full items-center justify-center rounded-[8px] bg-[#78df35] px-5 text-base font-black text-[#071006] shadow-[0_16px_34px_rgba(120,223,53,0.24)] transition hover:bg-[#8bed45]"
            href="/dashboard"
          >
            Ir al dashboard
          </Link>
        ) : null}

        <button
          className="flex h-16 w-full items-center justify-center rounded-[8px] border border-[#78df35]/80 text-base font-black text-[#78df35] transition hover:bg-[#78df35]/10"
          onClick={signOut}
          type="button"
        >
          Cerrar sesion
        </button>
      </div>
    </AuthShell>
  );
}
