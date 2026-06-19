'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, Student } from '@/lib/api';
import { StudentForm } from '../../student-form';

function Icon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function EditStudentPage() {
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStudent() {
      try {
        setStudent(await apiFetch<Student>(`/students/${params.id}`));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo cargar el alumno.');
      }
    }

    void loadStudent();
  }, [params.id]);

  const backHref = student ? `/students/${student.id}` : '/students';

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/students">
          Alumnos
        </Link>
        <Icon className="h-4 w-4" />
        {student ? (
          <>
            <Link className="hover:text-[#087a3d]" href={`/students/${student.id}`}>
              {student.firstName} {student.lastName}
            </Link>
            <Icon className="h-4 w-4" />
          </>
        ) : null}
        <span className="font-medium text-[#1e293b]">Editar</span>
      </div>

      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-[-0.03em] text-[#0f172a]">
          {student ? `Editar: ${student.firstName} ${student.lastName}` : 'Editar alumno'}
        </h1>
        <p className="mt-3 text-base text-[#475569]">
          Actualizá los datos y perfil deportivo del alumno.
        </p>
      </div>

      {error ? (
        <p className="mb-6 rounded-[8px] border border-[#b3261e]/30 bg-white px-5 py-4 text-sm text-[#b3261e]">
          {error}
        </p>
      ) : null}

      {!student && !error ? (
        <p className="text-sm text-[#475569]">Cargando...</p>
      ) : null}

      {student ? <StudentForm backHref={backHref} student={student} /> : null}
    </>
  );
}
