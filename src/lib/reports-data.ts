import { getBookings } from "./booking-storage";
import { getCustomerHistory, type CustomerHistoryRecord } from "./customer-history-storage";
import { getActiveStays } from "./stay-storage";
import { getExpenses } from "./expense-storage";
import { getRooms } from "./room-storage";

export type ReportPeriod = "Daily" | "Weekly" | "Monthly" | "Yearly";

export interface PeriodRow {
  label: string;
  income: number;
  expense: number;
  profit: number;
  occupancy: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// "NRH-20260721-0004" -> "2026-07-21"
function bookingDate(bookingId: string | undefined): string | null {
  const match = /NRH-(\d{4})(\d{2})(\d{2})-\d{4}/.exec(bookingId || "");
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function parseDateOnly(str: string | undefined | null): Date | null {
  if (!str) return null;
  const d = new Date(`${str.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getPeriodRanges(period: ReportPeriod): { label: string; start: Date; end: Date }[] {
  const today = dateOnly(new Date());
  const ranges: { label: string; start: Date; end: Date }[] = [];

  if (period === "Daily") {
    for (let i = 6; i >= 0; i--) {
      const start = new Date(today);
      start.setDate(today.getDate() - i);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      ranges.push({ label: start.toLocaleDateString("en-US", { day: "numeric", month: "short" }), start, end });
    }
  } else if (period === "Weekly") {
    // Rolling last-7-days blocks, most recent block ends today (not calendar Mon-Sun weeks)
    for (let i = 5; i >= 0; i--) {
      const end = new Date(today);
      end.setDate(today.getDate() - i * 7 + 1); // exclusive upper bound
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      const startLabel = start.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const endLabel = new Date(end.getTime() - MS_PER_DAY).toLocaleDateString("en-US", { day: "numeric", month: "short" });
      ranges.push({ label: `${startLabel} - ${endLabel}`, start, end });
    }
  } else if (period === "Monthly") {
    for (let i = 5; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      ranges.push({ label: start.toLocaleString("en-US", { month: "short" }), start, end });
    }
  } else {
    for (let i = 3; i >= 0; i--) {
      const start = new Date(today.getFullYear() - i, 0, 1);
      const end = new Date(today.getFullYear() - i + 1, 0, 1);
      ranges.push({ label: String(start.getFullYear()), start, end });
    }
  }

  return ranges;
}

export function getReportData(period: ReportPeriod): PeriodRow[] {
  const bookings = getBookings();
  const history = getCustomerHistory();
  const activeStays = getActiveStays();
  const expenses = getExpenses();
  const rooms = getRooms();
  const totalRooms = rooms.length || 1;
  const now = new Date();

  // Build real stay intervals (check-in -> actual/ongoing check-out) for occupancy math
  const stayIntervals: { start: Date; end: Date }[] = [];

  activeStays.forEach((s: any) => {
    const start = parseDateOnly(s.checkIn);
    if (!start) return;
    stayIntervals.push({ start, end: now }); // still occupied, counts up to now
  });

  history.forEach((r: CustomerHistoryRecord) => {
    const start = parseDateOnly(r.checkIn);
    const end = parseDateOnly(r.checkoutDate);
    if (!start) return;
    // include the checkout day itself as one occupied night
    stayIntervals.push({ start, end: end ? new Date(end.getTime() + MS_PER_DAY) : now });
  });

  const ranges = getPeriodRanges(period);

  return ranges.map(({ label, start, end }) => {
    const bookingIncome = bookings
      .filter((b: any) => {
        const d = parseDateOnly(bookingDate(b.bookingId));
        return d && d >= start && d < end;
      })
      .reduce((sum: number, b: any) => sum + (Number(b.advancePayment) || 0), 0);

    const checkoutIncome = history
      .filter((r) => {
        const d = parseDateOnly(r.checkoutDate);
        return d && d >= start && d < end;
      })
      .reduce((sum, r) => sum + (Number(r.remaining) || 0), 0);

    const expense = expenses
      .filter((e) => {
        const d = parseDateOnly(e.date);
        return d && d >= start && d < end;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const periodDays = Math.max(1, (end.getTime() - start.getTime()) / MS_PER_DAY);

    const occupiedNights = stayIntervals.reduce((sum, s) => {
      const overlapStart = s.start > start ? s.start : start;
      const overlapEnd = s.end < end ? s.end : end;
      const nights = (overlapEnd.getTime() - overlapStart.getTime()) / MS_PER_DAY;
      return sum + Math.max(0, nights);
    }, 0);

    const occupancy = Math.max(0, Math.min(100, Math.round((occupiedNights / (totalRooms * periodDays)) * 100)));

    const income = bookingIncome + checkoutIncome;

    return { label, income, expense, profit: income - expense, occupancy };
  });
}

export function percentDelta(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "New" : "0%";
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}
