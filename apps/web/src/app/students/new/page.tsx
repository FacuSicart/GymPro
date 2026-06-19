import Link from 'next/link';
import { StudentForm } from '../student-form';

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

export default function NewStudentPage() {
  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-sm text-[#64748b]">
        <Link className="hover:text-[#087a3d]" href="/students">
          Alumnos
        </Link>
        <Icon className="h-4 w-4" />
        <span className="font-medium text-[#1e293b]">Nuevo alumno</span>
      </div>

      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-[-0.03em] text-[#0f172a]">Nuevo alumno</h1>
        <p className="mt-3 text-base text-[#475569]">
          Completá el perfil deportivo y datos de contacto del alumno.
        </p>
      </div>

      <StudentForm />
    </>
  );
}
