import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, StatusPill } from "@/components/ui-kit";

type Props = {
  monthly: any[];
};

export default function IncomeChart({ monthly }: Props) {
  return (
    <Card className="lg:col-span-2 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Monthly Income vs Expense
          </h3>
          <p className="text-xs text-muted-foreground">
            Last 6 months performance
          </p>
        </div>

        <StatusPill tone="success">+18.4% YoY</StatusPill>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>

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

            <Area
              type="monotone"
              dataKey="income"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#incomeFill)"
            />

            <Area
              type="monotone"
              dataKey="expense"
              stroke="#F59E0B"
              strokeWidth={2.5}
              fill="url(#expenseFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}