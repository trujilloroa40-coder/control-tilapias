"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MetricLineChartProps = {
  data: Array<Record<string, string | number | null>>;
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xKey?: string;
  height?: number;
};

export function MetricLineChart({
  data,
  lines,
  xKey = "date",
  height = 260,
}: MetricLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-slate-500">
        Informacion insuficiente para graficar.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full rounded-lg border border-slate-200 bg-white p-3">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
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
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
