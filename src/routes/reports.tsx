import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, StatusPill, buttonGhost } from "@/components/ui-kit";
import { Download, Printer, FileText, TrendingUp, TrendingDown, Wallet, Percent } from "lucide-react";
import { monthly } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Navana Rest House" }] }),
  component: ReportsPage,
});

const tabs = ["Daily", "Weekly", "Monthly", "Yearly"] as const;

function ReportsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Monthly");

  const kpis = [
    { label: "Income", value: "৳5,62,000", delta: "+12.4%", icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Expense", value: "৳3,05,000", delta: "+4.1%", icon: TrendingDown, tone: "text-amber-600 bg-amber-50" },
    { label: "Profit", value: "৳2,57,000", delta: "+18.4%", icon: Wallet, tone: "text-primary bg-primary-soft" },
    { label: "Occupancy Rate", value: "78%", delta: "Above target", icon: Percent, tone: "text-blue-600 bg-blue-50" },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Income, expense, profit and occupancy analytics with exports."
        actions={
          <>
            <button className={buttonGhost}><FileText className="h-4 w-4" />Export PDF</button>
            <button className={buttonGhost}><Download className="h-4 w-4" />Export Excel</button>
            <button className={buttonGhost}><Printer className="h-4 w-4" />Print</button>
          </>
        }
      />

      <div className="mb-6 inline-flex rounded-xl border border-border bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${k.tone}`}>
                <k.icon className="h-4 w-4" />
              </div>
              <StatusPill tone="success">{k.delta}</StatusPill>
            </div>
            <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-foreground">Income vs Expense — {tab}</h3>
          <p className="text-xs text-muted-foreground">Comparative breakdown</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-foreground">Profit & Occupancy</h3>
          <p className="text-xs text-muted-foreground">Trends over time</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly.map((m, i) => ({ ...m, occupancy: 55 + i * 4 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="occupancy" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground">{tab} Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-right">Income</th>
                <th className="px-4 py-3 text-right">Expense</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 text-right">Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => (
                <tr key={m.month} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground">{m.month} 2026</td>
                  <td className="px-4 py-3 text-right text-foreground">৳{m.income.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-foreground">৳{m.expense.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">৳{m.profit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-foreground">{55 + i * 4}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
