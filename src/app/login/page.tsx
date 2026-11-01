import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_48%,#f1f5f9_100%)] px-4 py-8">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-teal-700 text-2xl font-bold text-white shadow-lg shadow-teal-900/15">
            CT
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">
            Control Tilapias
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Gestion de produccion para finca acuicola.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
