import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Save, User, BedDouble, CreditCard, Search } from "lucide-react";
import { Card, Field, PageHeader, SectionTitle, buttonGhost, buttonPrimary, inputClass, selectClass, textareaClass } from "@/components/ui-kit";
import { customerHistory, rooms } from "@/lib/mock-data";

export const Route = createFileRoute("/booking")({
  head: () => ({ meta: [{ title: "New Booking — Navana Rest House" }] }),
  component: BookingPage,
});

function BookingPage() {
  const [phone, setPhone] = useState("");
  const suggestion = useMemo(() => {
    if (phone.length < 4) return null;
    return customerHistory.find((c) => c.phone.replace(/\D/g, "").includes(phone.replace(/\D/g, "")));
  }, [phone]);

  const availableRooms = rooms.filter((r) => r.status === "Available");

  return (
    <div>
      <PageHeader
        title="New Booking"
        description="Register a new guest and assign a room in under a minute."
        actions={
          <>
            <button className={buttonGhost}>Cancel</button>
            <button className={buttonPrimary}>
              <Save className="h-4 w-4" />
              Save Booking
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle title="Customer Information" action={<User className="h-4 w-4 text-muted-foreground" />} />
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <Field label="Customer Name">
                <input className={inputClass} placeholder="e.g. Md. Tanvir Ahmed" />
              </Field>
              <Field label="Phone Number" hint={suggestion ? `Existing customer matched — ${suggestion.name}` : "Auto-suggests existing customers"}>
                <div className="relative">
                  <input
                    className={inputClass + " pl-9"}
                    placeholder="017XX-XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  {suggestion && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-card p-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{suggestion.name}</div>
                          <div className="text-[11px] text-muted-foreground">{suggestion.address} · NID {suggestion.nid}</div>
                        </div>
                        <button className="text-xs font-semibold text-primary hover:underline">Use details</button>
                      </div>
                    </div>
                  )}
                </div>
              </Field>
              <Field label="National ID">
                <input className={inputClass} placeholder="13 or 17 digit NID" />
              </Field>
              <Field label="Profession">
                <input className={inputClass} placeholder="e.g. Banker, Doctor" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address">
                  <input className={inputClass} placeholder="Full address" />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Room Information" action={<BedDouble className="h-4 w-4 text-muted-foreground" />} />
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <Field label="Room Number">
                <select className={selectClass}>
                  {availableRooms.map((r) => (
                    <option key={r.number}>{r.number} — {r.type} (৳{r.rent})</option>
                  ))}
                </select>
              </Field>
              <Field label="Room Type">
                <select className={selectClass}>
                  <option>Standard</option>
                  <option>Deluxe</option>
                  <option>Suite</option>
                </select>
              </Field>
              <Field label="Check-in Date">
                <input type="date" className={inputClass} defaultValue="2026-06-29" />
              </Field>
              <Field label="Check-in Time">
                <input type="time" className={inputClass} defaultValue="14:00" />
              </Field>
              <Field label="Expected Check-out Date">
                <input type="date" className={inputClass} defaultValue="2026-06-30" />
              </Field>
              <Field label="Expected Check-out Time">
                <input type="time" className={inputClass} defaultValue="12:00" />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Payment Information" action={<CreditCard className="h-4 w-4 text-muted-foreground" />} />
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              <Field label="Room Rent (per night)">
                <input className={inputClass} defaultValue="3500" />
              </Field>
              <Field label="Advance Payment">
                <input className={inputClass} placeholder="0" />
              </Field>
              <Field label="Payment Method">
                <select className={selectClass}>
                  <option>Cash</option>
                  <option>bKash</option>
                  <option>Nagad</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </Field>
              <div className="md:col-span-3">
                <Field label="Notes">
                  <textarea className={textareaClass} placeholder="Special requests, ID verification notes, etc." />
                </Field>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <button className={buttonPrimary + " h-12 px-8 text-base"}>
              <Save className="h-5 w-5" />
              Save Booking
            </button>
          </div>
        </div>

        <Card className="h-fit p-6">
          <h3 className="text-sm font-semibold text-foreground">Booking Summary</h3>
          <p className="text-xs text-muted-foreground">Live preview of charges</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Room" value="201 · Deluxe" />
            <Row label="Nights" value="1" />
            <Row label="Room Rent" value="৳3,500" />
            <Row label="Service Charge" value="৳350" />
            <Row label="VAT (15%)" value="৳577" />
            <div className="my-2 border-t border-border" />
            <Row label="Total" value="৳4,427" bold />
            <Row label="Advance" value="৳2,000" />
            <Row label="Due at Checkout" value="৳2,427" bold />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "font-bold text-foreground" : "font-medium text-foreground"}>{value}</dd>
    </div>
  );
}
