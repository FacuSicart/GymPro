'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);

      if (!response.canAccessInternalApp) {
        router.push('/access-status');
        return;
      }

      router.push('/dashboard');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'No se pudo iniciar sesion.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Acceso profesional"
      subtitle="Inicia sesion en tu cuenta"
      title="Bienvenido"
    >
      <form className="space-y-7" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold text-[#eef2f6]">
          Email
          <span className="mt-3 flex h-16 items-center gap-4 rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-5 text-[#c7ced7] transition focus-within:border-[#78df35] focus-within:ring-2 focus-within:ring-[#78df35]/20">
            <svg
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M4.5 7.5 12 13l7.5-5.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
              <path
                d="M5 6h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
            <input
              className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#8b949f]"
              placeholder="tu@email.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </span>
        </label>

        <label className="block text-sm font-semibold text-[#eef2f6]">
          Contrasena
          <span className="mt-3 flex h-16 items-center gap-4 rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-5 text-[#c7ced7] transition focus-within:border-[#78df35] focus-within:ring-2 focus-within:ring-[#78df35]/20">
            <svg
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 10V8a5 5 0 0 1 10 0v2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
              <path
                d="M6.5 10h11A1.5 1.5 0 0 1 19 11.5v6A1.5 1.5 0 0 1 17.5 19h-11A1.5 1.5 0 0 1 5 17.5v-6A1.5 1.5 0 0 1 6.5 10Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
            <input
              className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#8b949f]"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </span>
        </label>

        {error ? (
          <p className="rounded-[8px] border border-[#ff7a70]/30 bg-[#ff7a70]/10 px-4 py-3 text-sm text-[#ffb4ab]">
            {error}
          </p>
        ) : null}

        <button
          className="h-16 w-full rounded-[8px] bg-[#78df35] px-5 text-base font-black text-[#071006] shadow-[0_16px_34px_rgba(120,223,53,0.24)] transition hover:bg-[#8bed45] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Ingresando...' : 'Iniciar sesion'}
        </button>
      </form>

      <div className="mt-9 flex items-center gap-4 text-center text-[#c7ced7]">
        <span className="h-px flex-1 bg-white/12" />
        <span className="text-sm">Nuevo en ProGym?</span>
        <span className="h-px flex-1 bg-white/12" />
      </div>
      <Link
        className="mt-6 flex h-16 w-full items-center justify-center rounded-[8px] border border-[#78df35]/80 text-base font-black text-[#78df35] transition hover:bg-[#78df35]/10"
        href="/signup"
      >
        Solicitar acceso
      </Link>
    </AuthShell>
  );
}
