import { CalendarCheck, BedDouble, DoorOpen, TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { Card } from "@/components/ui-kit";

const stats = [
  {
    label: "Today's Bookings",
    value: "14",
    delta: "+3 vs yesterday",
    icon: CalendarCheck,
    tone: "text-primary bg-primary-soft",
  },
  {
    label: "Occupied Rooms",
    value: "12",
    delta: "of 18 rooms",
    icon: BedDouble,
    tone: "text-rose-600 bg-rose-50",
  },
  {
    label: "Available Rooms",
    value: "4",
    delta: "ready to assign",
    icon: DoorOpen,
    tone: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Today's Income",
    value: "৳42,500",
    delta: "+12.4%",
    icon: TrendingUp,
    tone: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Today's Expense",
    value: "৳18,200",
    delta: "+4.1%",
    icon: TrendingDown,
    tone: "text-amber-600 bg-amber-50",
  },
  {
    label: "Today's Profit",
    value: "৳24,300",
    delta: "Healthy margin",
    icon: Wallet,
    tone: "text-primary bg-primary-soft",
  },
  {
    label: "Pending Check Outs",
    value: "8",
    delta: "before 12:00 PM",
    icon: Clock,
    tone: "text-blue-600 bg-blue-50",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <div
            className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}
          >
            <s.icon className="h-4 w-4" />
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {s.label}
          </div>

          <div className="mt-1 text-2xl font-bold text-foreground">
            {s.value}
          </div>

          <div className="mt-1 text-[11px] text-muted-foreground">
            {s.delta}
          </div>
        </Card>
      ))}
    </div>
  );
}