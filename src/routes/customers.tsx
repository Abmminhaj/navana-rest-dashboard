import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Filter, Printer, Search, ArrowUpDown } from "lucide-react";
import { Card, PageHeader, buttonGhost, inputClass } from "@/components/ui-kit";
import { customerHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customer Information — Navana Rest House" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof typeof customerHistory[number]>("date");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const filtered = customerHistory.filter((c) =>
      `${c.name} ${c.phone} ${c.nid} ${c.room}`.toLowerCase().includes(query.toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
  }, [query, sortKey, asc]);

  const headers: { key: keyof typeof customerHistory[number]; label: string; align?: string }[] = [
    { key: "date", label: "Date" },
    { key: "name", label: "Customer Name" },
    { key: "phone", label: "Phone" },
    { key: "nid", label: "National ID" },
    { key: "address", label: "Address" },
    { key: "room", label: "Room" },
    { key: "checkIn", label: "Check In" },
    { key: "checkOut", label: "Check Out" },
    { key: "stay", label: "Total Stay" },
    { key: "rent", label: "Room Rent", align: "text-right" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div>
      <PageHeader
        title="Customer Information"
        description="Complete guest history with Excel-style filtering, sorting and export."
        actions={
          <>
            <button className={buttonGhost}><Filter className="h-4 w-4" />Filter</button>
            <button className={buttonGhost}><Download className="h-4 w-4" />Export Excel</button>
            <button className={buttonGhost}><Printer className="h-4 w-4" />Print</button>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={inputClass + " pl-9"}
              placeholder="Search by name, phone, NID or room…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{rows.length}</span> of {customerHistory.length} guests
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                {headers.map((h) => (
                  <th key={String(h.key)} className={`px-4 py-3 ${h.align ?? ""}`}>
                    <button
                      onClick={() => {
                        if (sortKey === h.key) setAsc(!asc);
                        else { setSortKey(h.key); setAsc(true); }
                      }}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {h.label}
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                  <td className="px-4 py-3">
                    <button className="font-semibold text-primary hover:underline">{c.name}</button>
                  </td>
                  <td className="px-4 py-3 text-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.nid}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.address}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-7 min-w-10 items-center justify-center rounded-md bg-primary-soft px-2 text-xs font-bold text-primary">{c.room}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.checkIn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.checkOut}</td>
                  <td className="px-4 py-3 text-foreground">{c.stay}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">৳{c.rent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
