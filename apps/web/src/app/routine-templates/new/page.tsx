'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { apiFetch, ExerciseGoal, LocalUser, RoutineTemplate } from '@/lib/api';

const goalOptions: Array<{ value: ExerciseGoal; label: string }> = [
  { value: 'STRENGTH', label: 'Fuerza' },
  { value: 'MOBILITY', label: 'Movilidad' },
  { value: 'ENDURANCE', label: 'Cardio' },
  { value: 'POWER', label: 'Potencia' },
  { value: 'CORE', label: 'Core' },
];

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalPositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default function NewRoutineTemplatePage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<ExerciseGoal | ''>('');
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const session = await apiFetch<{ user: LocalUser }>('/auth/session');
        setUser(session.user);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo cargar la sesion.');
      } finally {
        setLoading(false);
      }
    }

    void loadSession();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const template = await apiFetch<RoutineTemplate>('/routine-templates', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: optionalText(description),
          goal: goal || undefined,
          daysPerWeek: optionalPositiveNumber(daysPerWeek),
          days: [],
        }),
      });
      router.push(`/routine-templates/${template.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo crear la plantilla.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <nav className="text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/routine-templates">Plantillas</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[#1e293b]">Nueva plantilla</span>
      </nav>

      <header>
        <h1 className="text-3xl font-black text-[#0f172a]">Crear plantilla</h1>
        <p className="mt-2 text-base text-[#6b7280]">
          Crea una base reutilizable y despues agregale dias y ejercicios desde el editor.
        </p>
      </header>

      {error ? <p className="rounded-[8px] border border-[#f3c5c1] bg-white px-4 py-3 text-sm text-[#b3261e]">{error}</p> : null}
      {loading ? <p className="rounded-[8px] border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#64748b]">Cargando...</p> : null}

      {!loading && user?.role !== 'TRAINER' ? (
        <section className="max-w-3xl rounded-[8px] border border-[#dde5df] bg-white px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-black text-[#0f172a]">Solo lectura para administradores</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Los administradores pueden visualizar plantillas, pero la creacion queda reservada a entrenadores.
          </p>
          <Link className="mt-5 inline-flex rounded-[8px] bg-[#087a3d] px-5 py-3 text-sm font-black text-white" href="/routine-templates">
            Volver a plantillas
          </Link>
        </section>
      ) : null}

      {!loading && user?.role === 'TRAINER' ? (
        <form className="max-w-4xl space-y-6" onSubmit={onSubmit}>
          <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[#edf1ee] px-6 py-5">
              <h2 className="text-lg font-black text-[#0f172a]">Datos generales</h2>
            </div>
            <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-[#334155]">
                Objetivo
                <select
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm outline-none focus:border-[#087a3d]"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value as ExerciseGoal | '')}
                >
                  <option value="">Seleccionar objetivo</option>
                  {goalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-[#334155]">
                Dias por semana *
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
                  max={7}
                  min={1}
                  required
                  type="number"
                  value={daysPerWeek}
                  onChange={(event) => setDaysPerWeek(event.target.value)}
                />
              </label>
              <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
                Nombre *
                <input
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="ej. Fuerza inicial 3 dias"
                />
              </label>
              <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
                Descripcion
                <textarea
                  className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-[8px] bg-[#087a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#076b36] disabled:opacity-60" disabled={saving} type="submit">
              {saving ? 'Creando...' : 'Crear plantilla'}
            </button>
            <Link className="rounded-[8px] border border-[#d8dee6] px-6 py-3 text-sm font-semibold text-[#334155] transition hover:bg-[#f8faf9]" href="/routine-templates">
              Cancelar
            </Link>
          </div>
        </form>
      ) : null}
    </div>
  );
}
