import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, X, Search, Wallet } from "lucide-react";
import {
  Card,
  Field,
  PageHeader,
  SectionTitle,
  StatusPill,
  buttonGhost,
  buttonPrimary,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/ui-kit";
import { getActiveStays, removeActiveStay, addDeposit } from "@/lib/stay-storage";
import { updateRoomStatus } from "@/lib/room-storage";
import type { ActiveStay } from "@/lib/mock-data";
import { saveCustomerHistory } from "@/lib/customer-history-storage";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Check Out — Navana Rest House" }] }),
  component: CheckoutPage,
});

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function depositsTotalOf(stay: ActiveStay) {
  return (stay.deposits || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
}

function nightsBetween(checkIn: string, endDateISO: string) {
  const start = new Date(checkIn).getTime();
  const end = new Date(endDateISO).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 1;
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

function CheckoutPage() {
  const [list, setList] = useState<ActiveStay[]>([]);
  const [active, setActive] = useState<ActiveStay | null>(null);
  const [query, setQuery] = useState("");
  const [checkoutDate, setCheckoutDate] = useState(new Date().toISOString().slice(0, 10));
  const [checkoutTime, setCheckoutTime] = useState(nowHHMM());
  const [paidNow, setPaidNow] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [checkoutNotes, setCheckoutNotes] = useState("");

  const [depositTarget, setDepositTarget] = useState<ActiveStay | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    setList(getActiveStays());
  }, []);

  function refreshList() {
    setList(getActiveStays());
  }

  function openCheckout(stay: ActiveStay) {
    const today = new Date().toISOString().slice(0, 10);
    const nights = nightsBetween(stay.checkIn, today);
    const stayTotal = stay.rent * nights;
    const totalDue = stayTotal + (stay.previousDue || 0) - stay.advance - depositsTotalOf(stay);

    setActive(stay);
    setCheckoutDate(today);
    setCheckoutTime(nowHHMM());
    setPaidNow(Math.max(0, totalDue));
    setPaymentMethod("Cash");
    setCheckoutNotes("");
  }

  function handleSaveDeposit() {
    if (!depositTarget) return;
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) return;

    addDeposit(depositTarget.id, amt);
    refreshList();
    setDepositTarget(null);
    setDepositAmount("");
  }

  const filtered = list.filter(
    (s) =>
      s.customer.toLowerCase().includes(query.toLowerCase()) ||
      s.room.includes(query) ||
      s.phone.includes(query),
  );

  const actualNights = active ? nightsBetween(active.checkIn, checkoutDate) : 0;
  const activeDepositsTotal = active ? depositsTotalOf(active) : 0;
  const stayTotal = active ? active.rent * actualNights : 0;
  const totalDue = active
    ? stayTotal + (active.previousDue || 0) - active.advance - activeDepositsTotal
    : 0;
  const outstandingAfter = totalDue - paidNow;

  return (
    <div>
      <PageHeader
        title="Pending Check Outs"
        description="Guests currently checked-in. Complete checkout to settle balance and free the room."
        actions={<button className={buttonGhost}>Export List</button>}
      />

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={inputClass + " pl-9"}
              placeholder="Search by name, room or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> active stays
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Expected Check Out</th>
                <th className="px-4 py-3 text-right">Total Paid</th>
                <th className="px-4 py-3 text-right">Est. Due (today)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const dep = depositsTotalOf(s);
                const totalPaid = s.advance + dep;
                const nightsSoFar = nightsBetween(s.checkIn, new Date().toISOString().slice(0, 10));
                const estDue = s.rent * nightsSoFar + (s.previousDue || 0) - totalPaid;

                return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="inline-flex h-9 w-12 items-center justify-center rounded-md bg-primary-soft text-sm font-bold text-primary">
                        {s.room}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{s.customer}</div>
                      <div className="text-[11px] text-muted-foreground">NID {s.nid}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{s.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.checkIn}</td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{s.expectedCheckOut}</div>
                      <StatusPill tone="warning">Due today</StatusPill>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      ৳{totalPaid.toLocaleString()}
                      {dep > 0 && (
                        <div className="text-[11px] font-normal text-emerald-600">
                          (Advance ৳{s.advance.toLocaleString()} + Deposit ৳{dep.toLocaleString()})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">
                      ৳{Math.max(0, estDue).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setDepositTarget(s);
                            setDepositAmount("");
                          }}
                          className={buttonGhost + " h-8 px-3 text-xs"}
                        >
                          <Wallet className="h-3.5 w-3.5" /> Deposit
                        </button>
                        <button onClick={() => openCheckout(s)} className={buttonPrimary + " h-8 px-3 text-xs"}>
                          <LogOut className="h-3.5 w-3.5" /> Checkout
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    No pending check-outs. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Checkout — Room {active.room}</h3>
                <p className="text-xs text-muted-foreground">{active.customer} · {active.phone}</p>
              </div>
              <button onClick={() => setActive(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 border-b border-border bg-muted/20 px-6 py-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Actual Stay</span><span className="font-medium text-foreground">{actualNights} night(s) × ৳{active.rent.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Stay Total</span><span className="font-medium text-foreground">৳{stayTotal.toLocaleString()}</span></div>
              {(active.previousDue || 0) > 0 && (
                <div className="flex justify-between text-amber-700"><span>আগের বকেয়া (Carried)</span><span className="font-medium">৳{(active.previousDue || 0).toLocaleString()}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Advance Paid</span><span className="font-medium text-foreground">− ৳{active.advance.toLocaleString()}</span></div>
              {activeDepositsTotal > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Deposits During Stay</span><span className="font-medium text-foreground">− ৳{activeDepositsTotal.toLocaleString()}</span></div>
              )}
              <div className="mt-1 flex justify-between border-t border-border pt-1 text-base font-bold"><span className="text-foreground">Total Due Now</span><span className="text-primary">৳{Math.max(0, totalDue).toLocaleString()}</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <Field label="Checkout Date">
                <input
                  type="date"
                  className={inputClass}
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                />
              </Field>
              <Field label="Checkout Time">
                <input
                  type="time"
                  className={inputClass}
                  value={checkoutTime}
                  onChange={(e) => setCheckoutTime(e.target.value)}
                />
              </Field>
              <Field label="Paid Now (৳)">
                <input
                  type="number"
                  className={inputClass}
                  value={paidNow}
                  onChange={(e) => setPaidNow(Number(e.target.value))}
                />
              </Field>
              <Field label="Payment Method">
                <select
                  className={selectClass}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>Cash</option><option>bKash</option><option>Nagad</option><option>Card</option><option>Bank Transfer</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Notes">
                  <textarea
                    className={textareaClass}
                    placeholder="Damage charges, late check-out fee, etc."
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                  />
                </Field>
              </div>
              <div className="md:col-span-2 rounded-xl bg-primary-soft p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {outstandingAfter > 0 ? "বাকি থাকবে (Due)" : "Status"}
                  </span>
                  <span className={`text-lg font-bold ${outstandingAfter > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {outstandingAfter > 0 ? `৳${outstandingAfter.toLocaleString()}` : "Fully Paid ✓"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => setActive(null)} className={buttonGhost}>Cancel</button>
              <button
               onClick={() => {
  const finalDue = Math.max(0, totalDue - paidNow);

  saveCustomerHistory({
    ...active,
    remaining: paidNow,
    due: finalDue,
    actualNights,
    paymentMethod,
    checkoutNotes,
    checkoutDate,
    checkoutTime,
  });

  removeActiveStay(active.id);

  updateRoomStatus(active.room, "Available");

  refreshList();

  setActive(null);

  alert(
    finalDue > 0
      ? `Guest checked out. ৳${finalDue.toLocaleString()} বকেয়া থাকলো, পরের বার Booking-এ দেখাবে।`
      : "Guest checked out successfully. Fully paid."
  );
}}
                className={buttonPrimary}
              >
                Complete Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {depositTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-bold text-foreground">Add Deposit — Room {depositTarget.room}</h3>
              <button
                onClick={() => setDepositTarget(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-6">
              <p className="text-sm text-muted-foreground">
                {depositTarget.customer} · এখন পর্যন্ত জমা: ৳
                {(depositTarget.advance + depositsTotalOf(depositTarget)).toLocaleString()}
              </p>
              <Field label="Deposit Amount (৳)">
                <input
                  type="number"
                  className={inputClass}
                  placeholder="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => setDepositTarget(null)} className={buttonGhost}>Cancel</button>
              <button
                onClick={handleSaveDeposit}
                className="rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Save Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
