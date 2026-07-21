import { useEffect, useMemo, useState } from "react";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import ProfitChart from "@/components/dashboard/ProfitChart";
import IncomeChart from "@/components/dashboard/IncomeChart";
import PendingCheckout from "@/components/dashboard/PendingCheckout";
import RoomStatus from "@/components/dashboard/RoomStatus";
import DashboardStats, { type StatItem } from "@/components/dashboard/DashboardStats";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck, BedDouble, DoorOpen, TrendingUp, TrendingDown, Wallet, Clock, ArrowRight,
} from "lucide-react";
import { Card, PageHeader, SectionTitle, StatusPill, buttonPrimary } from "@/components/ui-kit";
import { monthly, type Room } from "@/lib/mock-data";
import { getRooms } from "@/lib/room-storage";
import { getActiveStays } from "@/lib/stay-storage";
import { getBookings } from "@/lib/booking-storage";
import { getCustomerHistory, type CustomerHistoryRecord } from "@/lib/customer-history-storage";

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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type Activity = {
  text: string;
  time: string;
  tone: "success" | "warning" | "info" | "neutral";
};

function bookingTimeKey(bookingId: string | undefined) {
  const match = /NRH-(\d{4})(\d{2})(\d{2})-(\d{4})/.exec(bookingId || "");
  if (!match) return 0;
  const [, y, mo, d, seq] = match;
  const base = new Date(`${y}-${mo}-${d}T00:00:00`).getTime();
  if (Number.isNaN(base)) return 0;
  return base + Number(seq) * 60000;
}

function checkoutTimeKey(record: CustomerHistoryRecord) {
  const t = new Date(`${record.checkoutDate}T${record.checkoutTime || "00:00"}`).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeStays, setActiveStays] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [history, setHistory] = useState<CustomerHistoryRecord[]>([]);
  const [today, setToday] = useState("");

  useEffect(() => {
    function loadAll() {
      setRooms(getRooms());
      setActiveStays(getActiveStays());
      setBookings(getBookings());
      setHistory(getCustomerHistory());
      setToday(todayISO());
    }

    loadAll();

    window.addEventListener("roomsUpdated", loadAll);
    return () => window.removeEventListener("roomsUpdated", loadAll);
  }, []);

  const todaysBookings = useMemo(
    () => bookings.filter((b) => typeof b.bookingId === "string" && b.bookingId.includes(`-${today.replace(/-/g, "")}-`)),
    [bookings, today]
  );

  const todaysCheckouts = useMemo(
    () => history.filter((r) => r.checkoutDate === today),
    [history, today]
  );

  const occupiedCount = rooms.filter((r) => r.status === "Occupied").length;
  const availableCount = rooms.filter((r) => r.status === "Available").length;

  const todaysIncome =
    todaysBookings.reduce((sum, b) => sum + (Number(b.advancePayment) || 0), 0) +
    todaysCheckouts.reduce((sum, r) => sum + (Number(r.remaining) || 0), 0);

  const stats: StatItem[] = [
    {
      label: "Today's Bookings",
      value: String(todaysBookings.length),
      delta: "New bookings today",
      icon: CalendarCheck,
      tone: "text-primary bg-primary-soft",
    },
    {
      label: "Occupied Rooms",
      value: String(occupiedCount),
      delta: `of ${rooms.length} rooms`,
      icon: BedDouble,
      tone: "text-rose-600 bg-rose-50",
    },
    {
      label: "Available Rooms",
      value: String(availableCount),
      delta: "ready to assign",
      icon: DoorOpen,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Today's Income",
      value: `৳${todaysIncome.toLocaleString()}`,
      delta: "Advance + checkout collections",
      icon: TrendingUp,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Today's Expense",
      value: "৳0",
      delta: "Expense tracking coming soon",
      icon: TrendingDown,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: "Today's Profit",
      value: `৳${todaysIncome.toLocaleString()}`,
      delta: "Based on income only, for now",
      icon: Wallet,
      tone: "text-primary bg-primary-soft",
    },
    {
      label: "Pending Check Outs",
      value: String(activeStays.length),
      delta: "Currently checked in",
      icon: Clock,
      tone: "text-blue-600 bg-blue-50",
    },
  ];

  const recentActivity: Activity[] = useMemo(() => {
    const bookingItems = bookings.map((b) => ({
      text: `${b.customerName || "Guest"} checked into Room ${b.room}`,
      time: b.checkInDate || "",
      tone: "info" as const,
      key: bookingTimeKey(b.bookingId),
    }));

    const checkoutItems = history.map((r) => ({
      text: `${r.customer} checked out from Room ${r.room}`,
      time: r.checkoutDate || "",
      tone: "neutral" as const,
      key: checkoutTimeKey(r),
    }));

    return [...bookingItems, ...checkoutItems]
      .sort((a, b) => b.key - a.key)
      .slice(0, 6)
      .map(({ text, time, tone }) => ({ text, time, tone }));
  }, [bookings, history]);

  const todayLabel = today
    ? new Date(today).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div>
      <PageHeader
        title="Good morning, Arif 👋"
        description={`Here's what's happening at Navana Rest House today${todayLabel ? ` — ${todayLabel}` : ""}.`}
        actions={
          <Link to="/booking" className={buttonPrimary}>
            New Booking
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <DashboardStats stats={stats} />

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

        <RecentActivity activities={recentActivity} />
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
