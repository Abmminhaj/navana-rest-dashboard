import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck, BedDouble, DoorOpen, TrendingUp, TrendingDown, Wallet, Clock, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, LineChart, Line,
} from "recharts";
import { Card, PageHeader, SectionTitle, StatusPill, buttonPrimary } from "@/components/ui-kit";
import { rooms, activeStays, monthly, activities } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Navana Rest House" },
      { name: "description", content: "Daily operations overview for Navana Rest House." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Today's Bookings", value: "14", delta: "+3 vs yesterday", icon: CalendarCheck, tone: "text-primary bg-primary-soft" },
  { label: "Occupied Rooms", value: "12", delta: "of 18 rooms", icon: BedDouble, tone: "text-rose-600 bg-rose-50" },
  { label: "Available Rooms", value: "4", delta: "ready to assign", icon: DoorOpen, tone: "text-emerald-600 bg-emerald-50" },
  { label: "Today's Income", value: "৳42,500", delta: "+12.4%", icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50" },
  { label: "Today's Expense", value: "৳18,200", delta: "+4.1%", icon: TrendingDown, tone: "text-amber-600 bg-amber-50" },
  { label: "Today's Profit", value: "৳24,300", delta: "Healthy margin", icon: Wallet, tone: "text-primary bg-primary-soft" },
  { label: "Pending Check Outs", value: "8", delta: "before 12:00 PM", icon: Clock, tone: "text-blue-600 bg-blue-50" },
];

const statusColor: Record<string, string> = {
  Occupied: "bg-rose-50 border-rose-200 text-rose-700",
  Available: "bg-emerald-50 border-emerald-200 text-emerald-700",
  Cleaning: "bg-amber-50 border-amber-200 text-amber-700",
  Maintenance: "bg-slate-100 border-slate-300 text-slate-600",
};

function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Good morning, Arif 👋"
        description="Here's what's happening at Navana Rest House today — Monday, June 29, 2026."
        actions={
          <Link to="/booking" className={buttonPrimary}>
            New Booking
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{s.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{s.delta}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionTitle
            title="Room Status Overview"
            action={
              <div className="flex items-center gap-3 text-[11px]">
                <Legend swatch="bg-emerald-500" label="Available" />
                <Legend swatch="bg-rose-500" label="Occupied" />
                <Legend swatch="bg-amber-500" label="Cleaning" />
                <Legend swatch="bg-slate-400" label="Maintenance" />
              </div>
            }
          />
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {rooms.map((r) => (
                <div
                  key={r.number}
                  className={`rounded-xl border px-3 py-3 text-left transition hover:scale-[1.02] ${statusColor[r.status]}`}
                >
                  <div className="text-lg font-bold leading-none">{r.number}</div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-wide opacity-80">{r.type}</div>
                  <div className="mt-2 text-[11px] font-semibold">{r.status}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Pending Check Outs"
            action={
              <Link to="/checkout" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            }
          />
          <ul className="divide-y divide-border">
            {activeStays.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary">
                  {s.room}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{s.customer}</div>
                  <div className="text-[11px] text-muted-foreground">Remaining ৳{s.remaining.toLocaleString()}</div>
                </div>
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                  Checkout
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Monthly Income vs Expense</h3>
              <p className="text-xs text-muted-foreground">Last 6 months performance</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Area type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={2.5} fill="url(#incomeFill)" />
                <Area type="monotone" dataKey="expense" stroke="#F59E0B" strokeWidth={2.5} fill="url(#expenseFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-foreground">Profit Trend</h3>
          <p className="text-xs text-muted-foreground">Monthly net profit</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">Monthly Expense Breakdown</h3>
          <p className="text-xs text-muted-foreground">Operational spend pattern</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="expense" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Recent Activity" />
          <ul className="divide-y divide-border">
            {activities.map((a, i) => (
              <li key={i} className="px-6 py-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    a.tone === "success" ? "bg-emerald-500" :
                    a.tone === "warning" ? "bg-amber-500" :
                    a.tone === "info" ? "bg-blue-500" : "bg-slate-400"
                  }`} />
                  <div className="min-w-0">
                    <div className="text-sm text-foreground">{a.text}</div>
                    <div className="text-[11px] text-muted-foreground">{a.time}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}
