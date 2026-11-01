"use client";

import { Edit, Fish, Trash2, Utensils, Waves } from "lucide-react";
import Link from "next/link";
import { deleteDailyRecordAction } from "@/features/daily-records/actions";
import { formatCurrency, formatDate, formatKg } from "@/lib/formatters";
import type { DailyRecordWithDetails } from "@/types/production";

export function DailyRecordCard({ record }: { record: DailyRecordWithDetails }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">
            {formatDate(record.record_date)}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            Registro diario
          </h3>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cycles/${record.cycle_id}/daily/${record.id}/edit`}
            className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Editar registro"
          >
            <Edit size={18} />
          </Link>
          <form action={deleteDailyRecordAction}>
            <input type="hidden" name="id" value={record.id} />
            <input type="hidden" name="cycle_id" value={record.cycle_id} />
            <button
              type="submit"
              onClick={(event) => {
                if (!window.confirm("¿Eliminar este registro diario?")) {
                  event.preventDefault();
                }
              }}
              className="grid size-11 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50"
              aria-label="Eliminar registro"
            >
              <Trash2 size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <Fish size={18} className="text-teal-700" />
          <span>
            Mortalidad:{" "}
            <strong>{record.mortality?.quantity ?? 0}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <Utensils size={18} className="text-teal-700" />
          <span>{formatKg(Number(record.feeding?.food_kg || 0))}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <Waves size={18} className="text-teal-700" />
          <span>pH: {record.ph ?? "N/D"}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <Utensils size={18} className="text-teal-700" />
          <span>{formatCurrency(Number(record.feeding?.food_cost || 0))}</span>
        </div>
      </div>

      {record.observations ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {record.observations}
        </p>
      ) : null}
    </article>
  );
}
