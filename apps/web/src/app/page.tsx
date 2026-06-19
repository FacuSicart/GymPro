import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#202124]">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
        <p className="text-sm font-medium uppercase text-[#2f6f6d]">
          Plataforma Fitness MVP
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          Gestion de acceso para admins y entrenadores.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-[#5f6368]">
          Los entrenadores pueden solicitar acceso publicamente. Un administrador
          debe aprobarlos antes de que operen dentro del sistema.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="bg-[#2f6f6d] px-4 py-2.5 text-sm font-semibold text-white"
            href="/login"
          >
            Iniciar sesion
          </Link>
          <Link
            className="border border-[#2f6f6d] px-4 py-2.5 text-sm font-semibold text-[#2f6f6d]"
            href="/signup"
          >
            Signup entrenador
          </Link>
        </div>
      </section>
    </main>
  );
}
