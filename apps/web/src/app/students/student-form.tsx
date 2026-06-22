'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { apiFetch, ExerciseGoal, Student } from '@/lib/api';

type StudentFormProps = {
  student?: Student;
  backHref?: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  goal: ExerciseGoal | '';
  experience: string;
  age: string;
  weightKg: string;
  heightCm: string;
  previousPhysicalNotes: string;
  restrictions: string;
  recurrentDiscomforts: string;
  observations: string;
};

const goalOptions: Array<{ value: ExerciseGoal; label: string }> = [
  { value: 'STRENGTH', label: 'Fuerza' },
  { value: 'MOBILITY', label: 'Movilidad' },
  { value: 'ENDURANCE', label: 'Cardio' },
  { value: 'POWER', label: 'Potencia' },
  { value: 'CORE', label: 'Core' },
];

function initialState(student?: Student): FormState {
  return {
    firstName: student?.firstName ?? '',
    lastName: student?.lastName ?? '',
    email: student?.email ?? '',
    phone: student?.phone ?? '',
    goal: student?.profile?.goal ?? '',
    experience: student?.profile?.experience ?? '',
    age: student?.profile?.age?.toString() ?? '',
    weightKg: student?.profile?.weightKg?.toString() ?? '',
    heightCm: student?.profile?.heightCm?.toString() ?? '',
    previousPhysicalNotes: student?.profile?.previousPhysicalNotes ?? '',
    restrictions: student?.profile?.restrictions ?? '',
    recurrentDiscomforts: student?.profile?.recurrentDiscomforts ?? '',
    observations: student?.profile?.observations ?? '',
  };
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function StudentForm({ student, backHref }: StudentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(student));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(student);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function goBack() {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const saved = await apiFetch<Student>(
        isEditing ? `/students/${student!.id}` : '/students',
        {
          method: isEditing ? 'PATCH' : 'POST',
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: optionalText(form.email),
            phone: optionalText(form.phone),
            profile: {
              goal: optionalText(form.goal),
              experience: optionalText(form.experience),
              age: optionalNumber(form.age),
              weightKg: optionalNumber(form.weightKg),
              heightCm: optionalNumber(form.heightCm),
              previousPhysicalNotes: optionalText(form.previousPhysicalNotes),
              restrictions: optionalText(form.restrictions),
              recurrentDiscomforts: optionalText(form.recurrentDiscomforts),
              observations: optionalText(form.observations),
            },
          }),
        },
      );

      router.push(`/students/${saved.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el alumno.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {error ? (
        <p className="rounded-[8px] border border-[#b3261e]/30 bg-white px-5 py-4 text-sm text-[#b3261e]">
          {error}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#edf1ee] px-6 py-5">
          <h2 className="text-lg font-black text-[#0f172a]">Datos del alumno</h2>
        </div>
        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#334155]">
            Nombre *
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
              required
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Apellido *
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
              required
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Email
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Teléfono
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#edf1ee] px-6 py-5">
          <h2 className="text-lg font-black text-[#0f172a]">Perfil deportivo</h2>
        </div>
        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#334155]">
            Objetivo
            <select
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] bg-white px-3 text-sm outline-none focus:border-[#087a3d]"
              value={form.goal}
              onChange={(event) => updateField('goal', event.target.value)}
            >
              <option value="">Seleccionar objetivo</option>
              {goalOptions.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Experiencia
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
              placeholder="ej. Principiante, 2 años, Avanzado"
              value={form.experience}
              onChange={(event) => updateField('experience', event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Edad
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
              min="10"
              max="100"
              type="number"
              value={form.age}
              onChange={(event) => updateField('age', event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Peso (kg)
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
              min="20"
              max="300"
              step="0.01"
              type="number"
              value={form.weightKg}
              onChange={(event) => updateField('weightKg', event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Altura (cm)
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]"
              min="80"
              max="260"
              step="0.01"
              type="number"
              value={form.heightCm}
              onChange={(event) => updateField('heightCm', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#edf1ee] px-6 py-5">
          <h2 className="text-lg font-black text-[#0f172a]">Restricciones y observaciones</h2>
        </div>
        <div className="grid gap-5 px-6 py-5">
          <label className="text-sm font-semibold text-[#334155]">
            Antecedentes físicos relevantes
            <textarea
              className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]"
              value={form.previousPhysicalNotes}
              onChange={(event) => updateField('previousPhysicalNotes', event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Restricciones para entrenar
            <textarea
              className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]"
              value={form.restrictions}
              onChange={(event) => updateField('restrictions', event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Molestias recurrentes reportadas
            <textarea
              className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]"
              value={form.recurrentDiscomforts}
              onChange={(event) => updateField('recurrentDiscomforts', event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Observaciones del entrenador
            <textarea
              className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]"
              value={form.observations}
              onChange={(event) => updateField('observations', event.target.value)}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-[8px] bg-[#087a3d] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(8,122,61,0.22)] transition hover:bg-[#076b36] disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear alumno'}
        </button>
        <button
          className="rounded-[8px] border border-[#d8dee6] px-6 py-3 text-sm font-semibold text-[#334155] transition hover:bg-[#f8faf9]"
          onClick={goBack}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
