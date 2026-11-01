"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CategoryBarChartProps = {
  data: Array<Record<string, string | number>>;
  xKey?: string;
  yKey?: string;
  height?: number;
};

export function CategoryBarChart({
  data,
  xKey = "category",
  yKey = "amount",
  height = 280,
}: CategoryBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-slate-500">
        Informacion insuficiente para graficar.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full rounded-lg border border-slate-200 bg-white p-3">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ left: -8, right: 12, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          />
          <Bar dataKey={yKey} name="Total" fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
