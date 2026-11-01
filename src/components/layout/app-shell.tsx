"use client";

import clsx from "clsx";
import {
  BarChart3,
  CalendarDays,
  Home,
  PlusCircle,
  Settings,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/cycles", label: "Ciclos", icon: Waves },
  { href: "/cycles/new", label: "Nuevo", icon: PlusCircle },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

type AppShellProps = {
  children: ReactNode;
  userEmail?: string;
};

export function AppShell({ children, userEmail }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="grid size-11 place-items-center rounded-xl bg-teal-700 font-bold text-white">
            CT
          </div>
          <div>
            <p className="font-bold text-slate-950">Control Tilapias</p>
            <p className="text-sm text-slate-500">Produccion acuicola</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex h-12 items-center gap-3 rounded-lg px-4 text-sm font-semibold transition",
                  isActive
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase text-slate-500">
              Sesion activa
            </p>
            <p className="truncate text-sm font-semibold text-slate-800">
              {userEmail || "Usuario autenticado"}
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:h-20 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700">
              Finca acuicola
            </p>
            <h1 className="text-lg font-bold text-slate-950 lg:text-2xl">
              Gestion de tilapias
            </h1>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <CalendarDays size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600">
              Produccion en tiempo real
            </span>
          </div>
          <div className="lg:hidden">
            <LogoutButton />
          </div>
        </header>

        <main className="px-4 pb-24 pt-5 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white px-2 pb-2 pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold transition",
                isActive
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-500 hover:bg-slate-100",
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
