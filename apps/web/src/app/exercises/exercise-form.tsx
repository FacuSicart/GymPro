'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {
  apiFetch,
  Exercise,
  ExerciseGoal,
  ExerciseLevel,
} from '@/lib/api';

type ExerciseFormProps = {
  exercise?: Exercise;
  backHref?: string;
};

type FormState = {
  name: string;
  description: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string;
  movementPattern: string;
  levels: ExerciseLevel[];
  equipmentNeeded: string;
  goals: ExerciseGoal[];
  technicalInstructions: string;
  commonMistakes: string;
  contraindications: string;
  videoUrl: string;
  imageUrl: string;
};

const levels: Array<{ value: ExerciseLevel; label: string }> = [
  { value: 'BEGINNER', label: 'Principiante' },
  { value: 'INTERMEDIATE', label: 'Intermedio' },
  { value: 'ADVANCED', label: 'Avanzado' },
];

const goals: Array<{ value: ExerciseGoal; label: string }> = [
  { value: 'STRENGTH', label: 'Fuerza' },
  { value: 'HYPERTROPHY', label: 'Hipertrofia' },
  { value: 'MOBILITY', label: 'Movilidad' },
  { value: 'ENDURANCE', label: 'Resistencia' },
  { value: 'CONDITIONING', label: 'Acondicionamiento' },
];

function initialState(exercise?: Exercise): FormState {
  return {
    name: exercise?.name ?? '',
    description: exercise?.description ?? '',
    primaryMuscleGroup: exercise?.primaryMuscleGroup ?? '',
    secondaryMuscleGroups: exercise?.secondaryMuscleGroups?.join(', ') ?? '',
    movementPattern: exercise?.movementPattern ?? '',
    levels: exercise?.levels ?? ['BEGINNER', 'INTERMEDIATE'],
    equipmentNeeded: exercise?.equipmentNeeded ?? '',
    goals: exercise?.goals ?? ['HYPERTROPHY'],
    technicalInstructions: exercise?.technicalInstructions ?? '',
    commonMistakes: exercise?.commonMistakes ?? '',
    contraindications: exercise?.contraindications ?? '',
    videoUrl: exercise?.videoUrl ?? '',
    imageUrl: exercise?.imageUrl ?? '',
  };
}

function optionalText(value: string) {
  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ExerciseForm({ exercise, backHref }: ExerciseFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(exercise));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(exercise);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleListField<T extends ExerciseGoal | ExerciseLevel>(
    field: 'goals' | 'levels',
    value: T,
  ) {
    setForm((current) => {
      const values = current[field] as T[];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return { ...current, [field]: nextValues };
    });
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
    setLoading(true);
    setError('');

    try {
      if (!form.goals.length || !form.levels.length) {
        throw new Error('Selecciona al menos un objetivo y un nivel.');
      }

      const saved = await apiFetch<Exercise>(
        isEditing ? `/exercises/${exercise!.id}` : '/exercises',
        {
          method: isEditing ? 'PATCH' : 'POST',
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            primaryMuscleGroup: form.primaryMuscleGroup,
            secondaryMuscleGroups: splitList(form.secondaryMuscleGroups),
            movementPattern: form.movementPattern,
            levels: form.levels,
            equipmentNeeded: form.equipmentNeeded,
            goals: form.goals,
            technicalInstructions: form.technicalInstructions,
            commonMistakes: optionalText(form.commonMistakes),
            contraindications: optionalText(form.contraindications),
            videoUrl: optionalText(form.videoUrl),
            imageUrl: optionalText(form.imageUrl),
          }),
        },
      );

      router.push(`/exercises/${saved.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el ejercicio.');
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
          <h2 className="text-lg font-black text-[#0f172a]">Datos del ejercicio</h2>
        </div>
        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#334155]">
            Nombre
            <input className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Grupo muscular principal
            <input className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]" value={form.primaryMuscleGroup} onChange={(event) => updateField('primaryMuscleGroup', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
            Descripcion
            <textarea className="mt-2 min-h-24 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]" value={form.description} onChange={(event) => updateField('description', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Grupos secundarios
            <input className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]" placeholder="Separados por coma" value={form.secondaryMuscleGroups} onChange={(event) => updateField('secondaryMuscleGroups', event.target.value)} />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Patron de movimiento
            <input className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]" value={form.movementPattern} onChange={(event) => updateField('movementPattern', event.target.value)} required />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#edf1ee] px-6 py-5">
          <h2 className="text-lg font-black text-[#0f172a]">Clasificacion</h2>
        </div>
        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <div className="text-sm font-semibold text-[#334155]">
            Nivel
            <div className="mt-2 grid gap-2">
              {levels.map((level) => (
                <label className="flex h-10 items-center gap-2 rounded-[8px] border border-[#d8dee6] px-3 text-sm font-normal text-[#334155]" key={level.value}>
                  <input checked={form.levels.includes(level.value)} onChange={() => toggleListField('levels', level.value)} type="checkbox" />
                  {level.label}
                </label>
              ))}
            </div>
          </div>
          <div className="text-sm font-semibold text-[#334155]">
            Objetivos
            <div className="mt-2 grid gap-2">
              {goals.map((goal) => (
                <label className="flex h-10 items-center gap-2 rounded-[8px] border border-[#d8dee6] px-3 text-sm font-normal text-[#334155]" key={goal.value}>
                  <input checked={form.goals.includes(goal.value)} onChange={() => toggleListField('goals', goal.value)} type="checkbox" />
                  {goal.label}
                </label>
              ))}
            </div>
          </div>
          <label className="text-sm font-semibold text-[#334155] sm:col-span-2">
            Equipamiento necesario
            <input className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]" value={form.equipmentNeeded} onChange={(event) => updateField('equipmentNeeded', event.target.value)} required />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[#dde5df] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#edf1ee] px-6 py-5">
          <h2 className="text-lg font-black text-[#0f172a]">Tecnica y referencias</h2>
        </div>
        <div className="grid gap-5 px-6 py-5">
          <label className="text-sm font-semibold text-[#334155]">
            Instrucciones tecnicas
            <textarea className="mt-2 min-h-28 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]" value={form.technicalInstructions} onChange={(event) => updateField('technicalInstructions', event.target.value)} required />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Errores comunes
            <textarea className="mt-2 min-h-20 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]" value={form.commonMistakes} onChange={(event) => updateField('commonMistakes', event.target.value)} />
          </label>
          <label className="text-sm font-semibold text-[#334155]">
            Contraindicaciones o restricciones fitness
            <textarea className="mt-2 min-h-20 w-full rounded-[8px] border border-[#d8dee6] px-3 py-2 text-sm outline-none focus:border-[#087a3d]" value={form.contraindications} onChange={(event) => updateField('contraindications', event.target.value)} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[#334155]">
              Video URL
              <input className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]" type="url" value={form.videoUrl} onChange={(event) => updateField('videoUrl', event.target.value)} />
            </label>
            <label className="text-sm font-semibold text-[#334155]">
              Imagen URL
              <input className="mt-2 h-11 w-full rounded-[8px] border border-[#d8dee6] px-3 text-sm outline-none focus:border-[#087a3d]" type="url" value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} />
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-[8px] bg-[#087a3d] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(8,122,61,0.22)] transition hover:bg-[#076b36] disabled:opacity-60" disabled={loading} type="submit">
          {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar ejercicio'}
        </button>
        <button className="rounded-[8px] border border-[#d8dee6] px-6 py-3 text-sm font-semibold text-[#334155] transition hover:bg-[#f8faf9]" onClick={goBack} type="button">
          Cancelar
        </button>
      </div>
    </form>
  );
}
