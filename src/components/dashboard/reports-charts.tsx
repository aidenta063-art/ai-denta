"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type DayPoint = {
  date: string;
  freeBookings: number;
  paidBookings: number;
  pageViews: number;
  visitors: number;
};

function formatDay(value: ReactNode) {
  const d = new Date(String(value));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TrafficChart({ series }: { series: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
        <Tooltip
          labelFormatter={formatDay}
          contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="pageViews"
          name="Page views"
          stroke="#7E00C9"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="visitors"
          name="Unique visitors"
          stroke="#B98AE8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BookingsChart({ series }: { series: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
        <Tooltip
          labelFormatter={formatDay}
          contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }}
        />
        <Legend />
        <Bar dataKey="freeBookings" name="Free" stackId="bookings" fill="#B98AE8" radius={[0, 0, 0, 0]} />
        <Bar dataKey="paidBookings" name="Paid" stackId="bookings" fill="#7E00C9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
