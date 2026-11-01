import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
            {value}
          </p>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </article>
  );
}
