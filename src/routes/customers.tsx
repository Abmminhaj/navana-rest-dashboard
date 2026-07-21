import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Printer, X, ImageOff } from "lucide-react";
import { Card, Field, PageHeader, SectionTitle, buttonGhost, buttonPrimary, inputClass } from "@/components/ui-kit";
import { getCustomerHistory, type CustomerHistoryRecord } from "@/lib/customer-history-storage";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customer Information — Navana Rest House" }] }),
  component: CustomersPage,
});

interface CustomerProfile {
  key: string;
  name: string;
  fatherName?: string;
  phone: string;
  nid: string;
  profession?: string;
  nationality?: string;
  address: string;
  nidPhoto?: string | null;
  customerPhoto?: string | null;
  records: CustomerHistoryRecord[];
  totalStays: number;
  totalSpent: number;
  lastVisit: string;
}

function parseDate(value: string | undefined) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function buildProfiles(history: CustomerHistoryRecord[]): CustomerProfile[] {
  const groups = new Map<string, CustomerHistoryRecord[]>();

  for (const record of history) {
    const key = (record.phone || "").replace(/\D/g, "") || record.customer || "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(record);
  }

  const profiles: CustomerProfile[] = [];

  groups.forEach((records, key) => {
    const sorted = [...records].sort(
      (a, b) => parseDate(b.checkoutDate) - parseDate(a.checkoutDate)
    );
    const latest = sorted[0];
    const nidPhoto = sorted.find((r) => r.nidPhoto)?.nidPhoto ?? null;
    const customerPhoto = sorted.find((r) => r.customerPhoto)?.customerPhoto ?? null;
    const totalSpent = sorted.reduce(
      (sum, r) => sum + (Number(r.advance) || 0) + (Number(r.remaining) || 0),
      0
    );

    profiles.push({
      key,
      name: latest.customer,
      fatherName: latest.fatherName,
      phone: latest.phone,
      nid: latest.nid,
      profession: latest.profession,
      nationality: latest.nationality,
      address: latest.address,
      nidPhoto,
      customerPhoto,
      records: sorted,
      totalStays: sorted.length,
      totalSpent,
      lastVisit: latest.checkoutDate,
    });
  });

  return profiles.sort((a, b) => parseDate(b.lastVisit) - parseDate(a.lastVisit));
}

function CustomersPage() {
  const [history, setHistory] = useState<CustomerHistoryRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    setHistory(getCustomerHistory());
  }, []);

  const profiles = useMemo(() => buildProfiles(history), [history]);

  const filtered = useMemo(
    () =>
      profiles.filter((p) =>
        `${p.name} ${p.phone} ${p.nid} ${p.address}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [profiles, query]
  );

  return (
    <div>
      <div className="print:hidden">
        <PageHeader
          title="Customer Information"
          description="Real guest history from completed checkouts — click a guest to view full profile and print details."
        />

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputClass + " pl-9"}
                placeholder="Search by name, phone, NID or address…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {profiles.length} guests
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Last Visit</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">National ID</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-right">Total Stays</th>
                  <th className="px-4 py-3 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.key}
                    className="cursor-pointer border-t border-border hover:bg-muted/30"
                    onClick={() => setSelected(p)}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{p.lastVisit || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary hover:underline">{p.name || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{p.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.nid || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.address || "—"}</td>
                    <td className="px-4 py-3 text-right text-foreground">{p.totalStays}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      ৳{p.totalSpent.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                      {profiles.length === 0
                        ? "এখনো কোনো Guest Checkout সম্পন্ন হয়নি। Checkout সম্পন্ন হলে এখানে Customer History দেখা যাবে।"
                        : "No matching guests found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm print:hidden">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-start justify-between border-b border-border px-6 py-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">{selected.phone} · {selected.totalStays} stay(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className={buttonGhost}>
                    <Printer className="h-4 w-4" /> Print
                  </button>
                  <button onClick={() => setSelected(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div>
                  <SectionTitle title="Personal Information" />
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Full Name"><input className={inputClass} value={selected.name || ""} readOnly /></Field>
                    <Field label="Father's Name"><input className={inputClass} value={selected.fatherName || ""} readOnly /></Field>
                    <Field label="Phone"><input className={inputClass} value={selected.phone || ""} readOnly /></Field>
                    <Field label="National ID"><input className={inputClass} value={selected.nid || ""} readOnly /></Field>
                    <Field label="Profession"><input className={inputClass} value={selected.profession || ""} readOnly /></Field>
                    <Field label="Nationality"><input className={inputClass} value={selected.nationality || ""} readOnly /></Field>
                    <div className="md:col-span-2">
                      <Field label="Address"><input className={inputClass} value={selected.address || ""} readOnly /></Field>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle title="Identity Documents" />
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">NID Photo</p>
                      {selected.nidPhoto ? (
                        <img src={selected.nidPhoto} alt="NID" className="h-32 w-full rounded-lg border border-border object-cover" />
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                          <ImageOff className="h-4 w-4" /> Not uploaded
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Customer Photo</p>
                      {selected.customerPhoto ? (
                        <img src={selected.customerPhoto} alt="Customer" className="h-32 w-full rounded-lg border border-border object-cover" />
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                          <ImageOff className="h-4 w-4" /> Not uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle title="Room / Stay History" />
                  <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Room</th>
                          <th className="px-3 py-2">Check In</th>
                          <th className="px-3 py-2">Expected Check Out</th>
                          <th className="px-3 py-2">Checkout Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.records.map((r, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="px-3 py-2 font-semibold text-foreground">{r.room}</td>
                            <td className="px-3 py-2 text-muted-foreground">{r.checkIn}</td>
                            <td className="px-3 py-2 text-muted-foreground">{r.expectedCheckOut}</td>
                            <td className="px-3 py-2 text-muted-foreground">{r.checkoutDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <SectionTitle title="Payment History" />
                  <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Checkout Date</th>
                          <th className="px-3 py-2 text-right">Advance</th>
                          <th className="px-3 py-2 text-right">Remaining Paid</th>
                          <th className="px-3 py-2 text-right">Total Paid</th>
                          <th className="px-3 py-2">Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.records.map((r, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">{r.checkoutDate}</td>
                            <td className="px-3 py-2 text-right text-foreground">৳{(Number(r.advance) || 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-foreground">৳{(Number(r.remaining) || 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-semibold text-foreground">
                              ৳{((Number(r.advance) || 0) + (Number(r.remaining) || 0)).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{r.paymentMethod || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border bg-muted/20">
                          <td className="px-3 py-2 font-semibold text-foreground">Total</td>
                          <td className="px-3 py-2" />
                          <td className="px-3 py-2" />
                          <td className="px-3 py-2 text-right font-bold text-primary">৳{selected.totalSpent.toLocaleString()}</td>
                          <td className="px-3 py-2" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {selected.records.some((r) => r.notes || r.checkoutNotes) && (
                  <div>
                    <SectionTitle title="Notes" />
                    <ul className="mt-3 space-y-2 text-sm">
                      {selected.records.map((r, i) => (
                        <li key={i}>
                          {r.notes && (
                            <p className="text-foreground">
                              <span className="text-xs text-muted-foreground">[Booking, Room {r.room}]</span> {r.notes}
                            </p>
                          )}
                          {r.checkoutNotes && (
                            <p className="text-foreground">
                              <span className="text-xs text-muted-foreground">[Checkout, Room {r.room}]</span> {r.checkoutNotes}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden print:block">
            <style>{`@media print { @page { size: A4; margin: 16mm; } }`}</style>
            <div className="mx-auto max-w-[720px] p-4 text-black">
              <div className="mb-6 border-b-2 border-black pb-4 text-center">
                <h1 className="text-2xl font-bold">Navana Rest House</h1>
                <p className="text-sm">Customer Details</p>
                <p className="mt-1 text-xs text-gray-500">Printed on {new Date().toLocaleDateString()}</p>
              </div>

              <div className="mb-5">
                <h2 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase">Personal Information</h2>
                <div className="grid grid-cols-2 gap-y-1 text-sm">
                  <span className="text-gray-600">Full Name</span><span>{selected.name || "—"}</span>
                  <span className="text-gray-600">Father's Name</span><span>{selected.fatherName || "—"}</span>
                  <span className="text-gray-600">Phone</span><span>{selected.phone || "—"}</span>
                  <span className="text-gray-600">National ID</span><span>{selected.nid || "—"}</span>
                  <span className="text-gray-600">Profession</span><span>{selected.profession || "—"}</span>
                  <span className="text-gray-600">Nationality</span><span>{selected.nationality || "—"}</span>
                </div>
              </div>

              <div className="mb-5">
                <h2 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase">Address</h2>
                <p className="text-sm">{selected.address || "—"}</p>
              </div>

              <div className="mb-5">
                <h2 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase">Stay Details</h2>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-400 text-left">
                      <th className="py-1 pr-6">Room</th>
                      <th className="py-1 pr-6">Check In</th>
                      <th className="py-1 pr-6">Expected Check Out</th>
                      <th className="py-1 pr-6">Checkout Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.records.map((r, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-1 pr-6">{r.room}</td>
                        <td className="py-1 pr-6">{r.checkIn}</td>
                        <td className="py-1 pr-6">{r.expectedCheckOut}</td>
                        <td className="py-1 pr-6">{r.checkoutDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-5">
                <h2 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase">Payment Details</h2>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-400 text-left">
                      <th className="py-1 pr-6">Checkout Date</th>
                      <th className="py-1 pr-6 text-right">Advance</th>
                      <th className="py-1 pr-6 text-right">Remaining</th>
                      <th className="py-1 pr-6 text-right">Total</th>
                      <th className="py-1">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.records.map((r, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-1 pr-6">{r.checkoutDate}</td>
                        <td className="py-1 pr-6 text-right">৳{(Number(r.advance) || 0).toLocaleString()}</td>
                        <td className="py-1 pr-6 text-right">৳{(Number(r.remaining) || 0).toLocaleString()}</td>
                        <td className="py-1 pr-6 text-right">৳{((Number(r.advance) || 0) + (Number(r.remaining) || 0)).toLocaleString()}</td>
                        <td className="py-1">{r.paymentMethod || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="py-1 pr-6">Grand Total</td>
                      <td /><td />
                      <td className="py-1 pr-6 text-right">৳{selected.totalSpent.toLocaleString()}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selected.records.some((r) => r.notes || r.checkoutNotes) && (
                <div className="mb-5">
                  <h2 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase">Notes</h2>
                  <ul className="list-disc pl-5 text-xs">
                    {selected.records.map((r, i) => (
                      <li key={i}>
                        {r.notes && <div>Room {r.room} (Booking): {r.notes}</div>}
                        {r.checkoutNotes && <div>Room {r.room} (Checkout): {r.checkoutNotes}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(selected.nidPhoto || selected.customerPhoto) && (
                <div className="mb-5">
                  <h2 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase">Photos</h2>
                  <div className="flex gap-4">
                    {selected.nidPhoto && (
                      <div>
                        <p className="mb-1 text-xs text-gray-600">NID Photo</p>
                        <img src={selected.nidPhoto} alt="NID" className="h-28 w-40 border border-gray-300 object-cover" />
                      </div>
                    )}
                    {selected.customerPhoto && (
                      <div>
                        <p className="mb-1 text-xs text-gray-600">Customer Photo</p>
                        <img src={selected.customerPhoto} alt="Customer" className="h-28 w-40 border border-gray-300 object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
