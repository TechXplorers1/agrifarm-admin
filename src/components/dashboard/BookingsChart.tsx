import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Booking } from "@/data/mockData";
import { useMemo } from "react";
import { format, subDays, subMonths, startOfDay, isAfter, isSameDay, isSameMonth, isSameYear, subYears } from "date-fns";

interface BookingsChartProps {
  bookings: Booking[];
  timeScale: "Day" | "Month" | "Year";
}

export function BookingsChart({ bookings, timeScale }: BookingsChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];

    if (timeScale === "Day") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const count = bookings.filter(b => isSameDay(new Date(b.createdAt), date)).length;
        data.push({
          label: format(date, "EEE"), // Mon, Tue
          bookings: count,
        });
      }
    } else if (timeScale === "Month") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(now, i);
        const count = bookings.filter(b => isSameMonth(new Date(b.createdAt), date)).length;
        data.push({
          label: format(date, "MMM"), // Jan, Feb
          bookings: count,
        });
      }
    } else if (timeScale === "Year") {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const date = subYears(now, i);
        const count = bookings.filter(b => isSameYear(new Date(b.createdAt), date)).length;
        data.push({
          label: format(date, "yyyy"), // 2024, 2025
          bookings: count,
        });
      }
    }

    return data;
  }, [bookings, timeScale]);

  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "200ms" }}>
      <h3 className="font-heading font-semibold text-card-foreground mb-4">Bookings Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="bookings"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
