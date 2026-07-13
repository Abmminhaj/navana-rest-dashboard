import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui-kit";

type Props = {
  monthly: any[];
};

export default function ProfitChart({ monthly }: Props) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-foreground">
        Profit Trend
      </h3>

      <p className="text-xs text-muted-foreground">
        Monthly net profit
      </p>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthly}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 12,
              }}
            />

            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, fill: "#10B981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}