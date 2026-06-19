'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, Exercise, LocalUser } from '@/lib/api';
import { ExerciseForm } from '../../exercise-form';

function Icon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function EditExercisePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadExercise() {
      try {
        const [sessionResponse, exerciseResponse] = await Promise.all([
          apiFetch<{ user: LocalUser }>('/auth/session'),
          apiFetch<Exercise>(`/exercises/${params.id}`),
        ]);

        const canEdit =
          sessionResponse.user.role === 'ADMIN' ||
          (exerciseResponse.createdByUserId === sessionResponse.user.id &&
            exerciseResponse.approvalStatus === 'PENDING');

        if (!canEdit) {
          router.push(`/exercises/${params.id}`);
          return;
        }

        setExercise(exerciseResponse);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo cargar el ejercicio.');
      }
    }

    void loadExercise();
  }, [params.id, router]);

  const backHref = exercise ? `/exercises/${exercise.id}` : '/exercises';

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/exercises">
          Catalogo
        </Link>
        <Icon className="h-4 w-4" />
        {exercise ? (
          <>
            <Link className="hover:text-[#087a3d]" href={`/exercises/${exercise.id}`}>
              {exercise.name}
            </Link>
            <Icon className="h-4 w-4" />
          </>
        ) : null}
        <span className="font-medium text-[#1e293b]">Editar</span>
      </div>

      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-[-0.03em] text-[#0f172a]">
          {exercise ? `Editar: ${exercise.name}` : 'Editar ejercicio'}
        </h1>
        <p className="mt-3 text-base text-[#475569]">
          Actualiza los datos, clasificacion y referencias tecnicas del ejercicio.
        </p>
      </div>

      {error ? (
        <p className="mb-6 rounded-[8px] border border-[#b3261e]/30 bg-white px-5 py-4 text-sm text-[#b3261e]">
          {error}
        </p>
      ) : null}

      {!exercise && !error ? <p className="text-sm text-[#475569]">Cargando...</p> : null}

      {exercise ? <ExerciseForm backHref={backHref} exercise={exercise} /> : null}
    </>
  );
}
