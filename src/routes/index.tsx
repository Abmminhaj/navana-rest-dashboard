import RecentActivity from "@/components/dashboard/RecentActivity";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import ProfitChart from "@/components/dashboard/ProfitChart";
import IncomeChart from "@/components/dashboard/IncomeChart";
import PendingCheckout from "@/components/dashboard/PendingCheckout";
import RoomStatus from "@/components/dashboard/RoomStatus";
import DashboardStats from "@/components/dashboard/DashboardStats";
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

      <DashboardStats />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RoomStatus
  rooms={rooms}
  statusColor={statusColor}
/>

        <PendingCheckout
  activeStays={activeStays}
/>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <IncomeChart monthly={monthly} />

        <ProfitChart monthly={monthly} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ExpenseChart monthly={monthly} />

        <RecentActivity activities={activities} />
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
