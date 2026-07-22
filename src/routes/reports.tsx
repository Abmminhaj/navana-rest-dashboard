import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, StatusPill, buttonGhost } from "@/components/ui-kit";
import { Download, Printer, FileText, TrendingUp, TrendingDown, Wallet, Percent } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { getReportData, percentDelta, type ReportPeriod, type PeriodRow } from "@/lib/reports-data";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Navana Rest House" }] }),
  component: ReportsPage,
});

const tabs: ReportPeriod[] = ["Daily", "Weekly", "Monthly", "Yearly"];

function ReportsPage() {
  const [tab, setTab] = useState<ReportPeriod>("Monthly");
  const [rows, setRows] = useState<PeriodRow[]>([]);

  useEffect(() => {
    function load() {
      setRows(getReportData(tab));
    }
    load();

    window.addEventListener("roomsUpdated", load);
    window.addEventListener("expensesUpdated", load);
    return () => {
      window.removeEventListener("roomsUpdated", load);
      window.removeEventListener("expensesUpdated", load);
    };
  }, [tab]);

  const current = rows[rows.length - 1];
  const previous = rows[rows.length - 2];

  const kpis = useMemo(() => {
    const income = current?.income ?? 0;
    const expense = current?.expense ?? 0;
    const profit = current?.profit ?? 0;
    const occupancy = current?.occupancy ?? 0;

    return [
      { label: "Income", value: `৳${income.toLocaleString()}`, delta: percentDelta(income, previous?.income ?? 0), icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50" },
      { label: "Expense", value: `৳${expense.toLocaleString()}`, delta: percentDelta(expense, previous?.expense ?? 0), icon: TrendingDown, tone: "text-amber-600 bg-amber-50" },
      { label: "Profit", value: `৳${profit.toLocaleString()}`, delta: percentDelta(profit, previous?.profit ?? 0), icon: Wallet, tone: "text-primary bg-primary-soft" },
      { label: "Occupancy Rate", value: `${occupancy}%`, delta: percentDelta(occupancy, previous?.occupancy ?? 0), icon: Percent, tone: "text-blue-600 bg-blue-50" },
    ];
  }, [current, previous]);

  function handleExportExcel() {
    const header = ["Period", "Income", "Expense", "Profit", "Occupancy %"];
    const dataRows = rows.map((r) => [r.label, String(r.income), String(r.expense), String(r.profit), String(r.occupancy)]);

    const csv = [header, ...dataRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `navana-report-${tab.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <style>{`
        @media print {
          @page { margin: 14mm; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print-only { display: block !important; }
          .print-avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="print-only mb-4 hidden">
        <h1 className="text-lg font-bold text-foreground">Navana Rest House — {tab} Report</h1>
        <p className="text-xs text-muted-foreground">Printed on {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
      </div>

      <PageHeader
        title="Reports"
        description="Income, expense, profit and occupancy analytics with exports."
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <button className={buttonGhost} onClick={() => window.print()}><FileText className="h-4 w-4" />Export PDF</button>
            <button className={buttonGhost} onClick={handleExportExcel}><Download className="h-4 w-4" />Export Excel</button>
            <button className={buttonGhost} onClick={() => window.print()}><Printer className="h-4 w-4" />Print</button>
          </div>
        }
      />

      <div className="mb-6 inline-flex rounded-xl border border-border bg-card p-1 print:hidden">
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 print-avoid-break">
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
        <Card className="p-6 print-avoid-break">
          <h3 className="text-sm font-semibold text-foreground">Income vs Expense — {tab}</h3>
          <p className="text-xs text-muted-foreground">Comparative breakdown</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 print-avoid-break">
          <h3 className="text-sm font-semibold text-foreground">Profit & Occupancy</h3>
          <p className="text-xs text-muted-foreground">Trends over time</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
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

      <Card className="mt-6 print-avoid-break">
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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">কোনো Data পাওয়া যায়নি</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.label} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground">{r.label}</td>
                    <td className="px-4 py-3 text-right text-foreground">৳{r.income.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-foreground">৳{r.expense.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-bold ${r.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>৳{r.profit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-foreground">{r.occupancy}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
