"use client";

import { Edit, Scale, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteBiometricAction } from "@/features/biometrics/actions";
import { formatDate, formatKg, formatNumber } from "@/lib/formatters";
import type { BiometricRecord } from "@/types/production";

export function BiometricCard({ record }: { record: BiometricRecord }) {
  return (
    <article
      id={record.id}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">
            {formatDate(record.record_date)}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">Biometria</h3>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cycles/${record.cycle_id}/biometrics/${record.id}/edit`}
            className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Editar biometria"
          >
            <Edit size={18} />
          </Link>
          <form action={deleteBiometricAction}>
            <input type="hidden" name="id" value={record.id} />
            <input type="hidden" name="cycle_id" value={record.cycle_id} />
            <button
              type="submit"
              onClick={(event) => {
                if (!window.confirm("¿Eliminar esta biometria?")) {
                  event.preventDefault();
                }
              }}
              className="grid size-11 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50"
              aria-label="Eliminar biometria"
            >
              <Trash2 size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <Scale size={18} className="text-teal-700" />
          <span>{formatNumber(Number(record.avg_weight_g))} g</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <Scale size={18} className="text-teal-700" />
          <span>{record.avg_size_cm ? `${formatNumber(record.avg_size_cm)} cm` : "Sin talla"}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <Scale size={18} className="text-teal-700" />
          <span>{record.sampled_fish_count ?? 0} peces</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <Scale size={18} className="text-teal-700" />
          <span>{formatKg(Number(record.sample_total_weight_kg || 0))}</span>
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
