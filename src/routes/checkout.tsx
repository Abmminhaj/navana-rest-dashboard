import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, X, Search } from "lucide-react";
import { Card, Field, PageHeader, SectionTitle, StatusPill, buttonGhost, buttonPrimary, inputClass, selectClass, textareaClass } from "@/components/ui-kit";
import { activeStays, type ActiveStay } from "@/lib/mock-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Check Out — Navana Rest House" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const [list, setList] = useState(activeStays);
  const [active, setActive] = useState<ActiveStay | null>(null);
  const [query, setQuery] = useState("");

  const filtered = list.filter(
    (s) =>
      s.customer.toLowerCase().includes(query.toLowerCase()) ||
      s.room.includes(query) ||
      s.phone.includes(query),
  );

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
                <th className="px-4 py-3 text-right">Advance Paid</th>
                <th className="px-4 py-3 text-right">Remaining</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
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
                  <td className="px-4 py-3 text-right font-medium text-foreground">৳{s.advance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">৳{s.remaining.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setActive(s)} className={buttonPrimary + " h-8 px-3 text-xs"}>
                      <LogOut className="h-3.5 w-3.5" /> Checkout
                    </button>
                  </td>
                </tr>
              ))}
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
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <Field label="Checkout Date">
                <input type="date" className={inputClass} defaultValue="2026-06-29" />
              </Field>
              <Field label="Checkout Time">
                <input type="time" className={inputClass} defaultValue="12:00" />
              </Field>
              <Field label="Remaining Payment">
                <input className={inputClass} defaultValue={active.remaining} />
              </Field>
              <Field label="Payment Method">
                <select className={selectClass}>
                  <option>Cash</option><option>bKash</option><option>Nagad</option><option>Card</option><option>Bank Transfer</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Notes">
                  <textarea className={textareaClass} placeholder="Damage charges, late check-out fee, etc." />
                </Field>
              </div>
              <div className="md:col-span-2 rounded-xl bg-primary-soft p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Settled</span>
                  <span className="text-lg font-bold text-primary">৳{(active.advance + active.remaining).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => setActive(null)} className={buttonGhost}>Cancel</button>
              <button
                onClick={() => {
                  setList((l) => l.filter((x) => x.id !== active.id));
                  setActive(null);
                }}
                className={buttonPrimary}
              >
                Complete Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
