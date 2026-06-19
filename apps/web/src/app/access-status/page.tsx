'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthProfile, clearToken, getProfile } from '@/lib/api';

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
    clearToken();
    window.location.href = '/login';
  }

  const user = profile?.user;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-6 py-10 text-[#202124]">
      <section className="w-full max-w-lg border border-[#d8dee6] bg-white p-6">
        <h1 className="text-2xl font-semibold">Estado de acceso</h1>
        {error ? <p className="mt-4 text-sm text-[#b3261e]">{error}</p> : null}
        {!error && !profile ? <p className="mt-4 text-sm">Cargando...</p> : null}
        {profile && !user ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[#5f6368]">
              No hay un usuario local asociado a esta sesion.
            </p>
          </div>
        ) : null}
        {user ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[#5f6368]">{user.firstName} {user.lastName}</p>
            <p className="text-base font-semibold">{labels[user.status]}</p>
            {user.status === 'PENDING_APPROVAL' ? (
              <p className="text-sm text-[#5f6368]">
                Un administrador debe aprobar tu cuenta antes de acceder al dashboard.
              </p>
            ) : null}
            {user.status === 'REJECTED' ? (
              <p className="text-sm text-[#5f6368]">
                {user.rejectionReason || 'La solicitud fue rechazada por un administrador.'}
              </p>
            ) : null}
            {user.status === 'ACTIVE' ? (
              <Link className="inline-block bg-[#2f6f6d] px-4 py-2 text-sm font-semibold text-white" href="/dashboard">
                Ir al dashboard
              </Link>
            ) : null}
          </div>
        ) : null}
        <button className="mt-6 text-sm font-medium text-[#2f6f6d]" onClick={signOut} type="button">
          Cerrar sesion
        </button>
      </section>
    </main>
  );
}
