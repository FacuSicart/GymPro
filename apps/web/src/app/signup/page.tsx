'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { apiFetch, login, storeToken } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await apiFetch('/auth/trainer-signup', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const response = await login(email, password);
      storeToken(response.accessToken);
      setMessage('Solicitud enviada. Tu cuenta queda pendiente de aprobacion.');
      router.push('/access-status');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'No se pudo crear la solicitud.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Alta controlada"
      subtitle="Solicita acceso como entrenador"
      title="Crear solicitud"
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#eef2f6]">
            Nombre
            <input
              className="mt-3 h-14 w-full rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-4 text-base text-white outline-none transition placeholder:text-[#8b949f] focus:border-[#78df35] focus:ring-2 focus:ring-[#78df35]/20"
              placeholder="Nombre"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-semibold text-[#eef2f6]">
            Apellido
            <input
              className="mt-3 h-14 w-full rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-4 text-base text-white outline-none transition placeholder:text-[#8b949f] focus:border-[#78df35] focus:ring-2 focus:ring-[#78df35]/20"
              placeholder="Apellido"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </label>
        </div>

        <label className="block text-sm font-semibold text-[#eef2f6]">
          Email
          <input
            className="mt-3 h-14 w-full rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-4 text-base text-white outline-none transition placeholder:text-[#8b949f] focus:border-[#78df35] focus:ring-2 focus:ring-[#78df35]/20"
            placeholder="tu@email.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-semibold text-[#eef2f6]">
          Contrasena
          <input
            className="mt-3 h-14 w-full rounded-[8px] border border-white/14 bg-[#0c1117]/70 px-4 text-base text-white outline-none transition placeholder:text-[#8b949f] focus:border-[#78df35] focus:ring-2 focus:ring-[#78df35]/20"
            placeholder="Minimo 8 caracteres"
            type="password"
            minLength={8}
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
            title="Debe tener minimo 8 caracteres, una mayuscula, una minuscula y un numero."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <span className="mt-2 block text-xs font-medium text-[#c7ced7]">
            Minimo 8 caracteres, una mayuscula, una minuscula y un numero.
          </span>
        </label>

        {error ? (
          <p className="rounded-[8px] border border-[#ff7a70]/30 bg-[#ff7a70]/10 px-4 py-3 text-sm text-[#ffb4ab]">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-[8px] border border-[#78df35]/30 bg-[#78df35]/10 px-4 py-3 text-sm text-[#b9f893]">
            {message}
          </p>
        ) : null}

        <button
          className="h-16 w-full rounded-[8px] bg-[#78df35] px-5 text-base font-black text-[#071006] shadow-[0_16px_34px_rgba(120,223,53,0.24)] transition hover:bg-[#8bed45] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Enviando...' : 'Solicitar acceso'}
        </button>
      </form>

      <div className="mt-9 flex items-center gap-4 text-center text-[#c7ced7]">
        <span className="h-px flex-1 bg-white/12" />
        <span className="text-sm">Ya tienes cuenta?</span>
        <span className="h-px flex-1 bg-white/12" />
      </div>
      <Link
        className="mt-6 flex h-16 w-full items-center justify-center rounded-[8px] border border-[#78df35]/80 text-base font-black text-[#78df35] transition hover:bg-[#78df35]/10"
        href="/login"
      >
        Iniciar sesion
      </Link>
    </AuthShell>
  );
}
