export function SetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-xl rounded-lg border border-amber-200 bg-white p-6 shadow-lg shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase text-amber-700">
          Configuracion pendiente
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Conecta Supabase para activar la aplicacion
        </h1>
        <p className="mt-3 text-slate-600">
          Crea un archivo .env.local con las variables de .env.example. La
          autenticacion, las rutas protegidas y la sincronizacion usan esas
          credenciales.
        </p>
        <div className="mt-5 rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
          <p>NEXT_PUBLIC_SUPABASE_URL=...</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
        </div>
      </section>
    </main>
  );
}
