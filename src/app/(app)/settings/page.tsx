import { hasSupabaseEnv } from "@/lib/supabase/config";

const exports = [
  { href: "/exports/cycles", label: "Ciclos" },
  { href: "/exports/daily-records", label: "Registros diarios" },
  { href: "/exports/mortality", label: "Mortalidad" },
  { href: "/exports/feeding", label: "Alimentacion" },
  { href: "/exports/biometrics", label: "Biometrias" },
  { href: "/exports/expenses", label: "Gastos" },
  { href: "/exports/closures", label: "Cierres" },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">Ajustes</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          Configuracion de produccion
        </h2>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <p>
            Supabase:{" "}
            <span className="font-semibold text-slate-950">
              {hasSupabaseEnv ? "configurado" : "pendiente"}
            </span>
          </p>
          <p>
            Las variables publicas de Supabase se leen desde el entorno. Los
            archivos `.env*` y credenciales locales estan excluidos por Git.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Respaldo CSV
        </p>
        <h3 className="mt-2 text-xl font-bold text-slate-950">
          Exportar datos
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Las descargas usan la sesion activa y respetan las politicas RLS de
          Supabase.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exports.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">PWA</p>
        <h3 className="mt-2 text-xl font-bold text-slate-950">
          Instalacion movil
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          En Android abre la app desde Chrome, toca el menu de tres puntos y
          elige Instalar aplicacion o Agregar a pantalla principal.
        </p>
      </section>
    </div>
  );
}
