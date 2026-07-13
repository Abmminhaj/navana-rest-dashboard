import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui-kit";

type Props = {
  monthly: any[];
};

export default function ExpenseChart({ monthly }: Props) {
  return (
    <Card className="p-6 lg:col-span-2">
      <h3 className="text-sm font-semibold text-foreground">
        Monthly Expense Breakdown
      </h3>

      <p className="text-xs text-muted-foreground">
        Operational spend pattern
      </p>

      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly}>
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

            <Bar
              dataKey="expense"
              fill="#2563EB"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}