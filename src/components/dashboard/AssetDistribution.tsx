import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Booking } from "@/data/mockData";
import { useMemo } from "react";

interface AssetDistributionProps {
  bookings: Booking[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Equipment": "hsl(var(--primary))",
  "Service Offering": "hsl(var(--warning))",
  "Service": "hsl(var(--warning))",
  "Transport Vehicle": "hsl(var(--destructive))",
  "Transport": "hsl(var(--destructive))",
  "Worker Group": "hsl(var(--success))",
};

export function AssetDistribution({ bookings }: AssetDistributionProps) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};

    bookings.forEach(b => {
      let type = b.assetType || "Other";
      // Normalize types
      if (type.includes("Service")) type = "Service";
      if (type.includes("Transport")) type = "Transport";
      if (type.includes("Worker")) type = "Worker Group";

      counts[type] = (counts[type] || 0) + 1;
    });

    const data = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: CATEGORY_COLORS[name] || "hsl(var(--muted-foreground))"
    }));

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  }, [bookings]);

  return (
    <div className="rounded-xl bg-card p-5 shadow-card animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="font-heading font-semibold text-card-foreground mb-4">Bookings by Category</h3>
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [value, "Bookings"]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No bookings data available
          </div>
        )}
      </div>
    </div>
  );
}
