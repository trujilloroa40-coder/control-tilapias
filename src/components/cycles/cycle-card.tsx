import { CalendarDays, Fish, MapPin } from "lucide-react";
import Link from "next/link";
import { getCycleProductionDay } from "@/lib/calculations/cycles";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import type { ProductionCycle } from "@/types/production";
import { CycleStatusBadge } from "./cycle-status-badge";

export function CycleCard({ cycle }: { cycle: ProductionCycle }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/cycles/${cycle.id}`}
            className="text-lg font-bold text-slate-950 hover:text-teal-800"
          >
            {cycle.code}
          </Link>
          <p className="mt-1 truncate text-sm text-slate-500">
            {cycle.name || "Sin nombre adicional"}
          </p>
        </div>
        <CycleStatusBadge status={cycle.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin size={17} className="text-teal-700" />
          {cycle.pond}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={17} className="text-teal-700" />
          Siembra: {formatDate(cycle.stocking_date)}
        </div>
        <div className="flex items-center gap-2">
          <Fish size={17} className="text-teal-700" />
          {formatNumber(cycle.initial_fish_count)} peces sembrados
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
        <div>
          <p className="text-slate-500">Dia</p>
          <p className="font-bold text-slate-950">
            {cycle.status === "preparation" ? "Pendiente" : getCycleProductionDay(cycle)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Alevinos</p>
          <p className="font-bold text-slate-950">
            {formatCurrency(Number(cycle.fingerlings_total_cost || 0))}
          </p>
        </div>
      </div>
    </article>
  );
}
