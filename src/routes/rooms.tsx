import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, StatusPill, buttonGhost } from "@/components/ui-kit";
import { rooms, type RoomStatus } from "@/lib/mock-data";
import { X, BedDouble, Wifi, Tv, Wind, ShowerHead } from "lucide-react";

export const Route = createFileRoute("/rooms")({
  head: () => ({ meta: [{ title: "Rooms — Navana Rest House" }] }),
  component: RoomsPage,
});

const statusStyles: Record<RoomStatus, { bg: string; dot: string; tone: "success" | "danger" | "warning" | "neutral" }> = {
  Available: { bg: "bg-emerald-50 border-emerald-200 hover:border-emerald-400", dot: "bg-emerald-500", tone: "success" },
  Occupied: { bg: "bg-rose-50 border-rose-200 hover:border-rose-400", dot: "bg-rose-500", tone: "danger" },
  Cleaning: { bg: "bg-amber-50 border-amber-200 hover:border-amber-400", dot: "bg-amber-500", tone: "warning" },
  Maintenance: { bg: "bg-slate-100 border-slate-300 hover:border-slate-400", dot: "bg-slate-500", tone: "neutral" },
};

function RoomsPage() {
  const [filter, setFilter] = useState<RoomStatus | "All">("All");
  const [selected, setSelected] = useState<typeof rooms[number] | null>(null);

  const summary = {
    total: rooms.length,
    Occupied: rooms.filter((r) => r.status === "Occupied").length,
    Available: rooms.filter((r) => r.status === "Available").length,
    Maintenance: rooms.filter((r) => r.status === "Maintenance").length,
    Cleaning: rooms.filter((r) => r.status === "Cleaning").length,
  };

  const visible = filter === "All" ? rooms : rooms.filter((r) => r.status === filter);
  const byFloor = visible.reduce<Record<number, typeof rooms>>((acc, r) => {
    (acc[r.floor] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Rooms" description="Real-time inventory across all floors." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total Rooms" value={summary.total} accent="bg-primary-soft text-primary" />
        <Stat label="Occupied" value={summary.Occupied} accent="bg-rose-50 text-rose-700" />
        <Stat label="Available" value={summary.Available} accent="bg-emerald-50 text-emerald-700" />
        <Stat label="Maintenance" value={summary.Maintenance} accent="bg-slate-100 text-slate-700" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["All", "Available", "Occupied", "Cleaning", "Maintenance"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-6">
        {Object.entries(byFloor).map(([floor, list]) => (
          <Card key={floor} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Floor {floor}</h3>
              <span className="text-xs text-muted-foreground">{list.length} rooms</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {list.map((r) => {
                const s = statusStyles[r.status];
                return (
                  <button
                    key={r.number}
                    onClick={() => setSelected(r)}
                    className={`group rounded-xl border p-4 text-left transition ${s.bg}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-2xl font-bold text-foreground">{r.number}</div>
                      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                    </div>
                    <div className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{r.type}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <StatusPill tone={s.tone}>{r.status}</StatusPill>
                      <span className="text-xs font-semibold text-foreground">৳{r.rent.toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Room {selected.number}</h3>
                  <p className="text-xs text-muted-foreground">{selected.type} · Floor {selected.floor}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusPill tone={statusStyles[selected.status].tone}>{selected.status}</StatusPill>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nightly Rate</span>
                <span className="text-base font-bold text-foreground">৳{selected.rent.toLocaleString()}</span>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amenities</div>
                <div className="flex flex-wrap gap-2">
                  {[{ i: Wifi, l: "Wi-Fi" }, { i: Tv, l: "Smart TV" }, { i: Wind, l: "AC" }, { i: ShowerHead, l: "Hot Shower" }].map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      <a.i className="h-3.5 w-3.5" />{a.l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => setSelected(null)} className={buttonGhost}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Card className="p-5">
      <div className={`inline-flex rounded-lg px-2 py-1 text-[11px] font-semibold ${accent}`}>{label}</div>
      <div className="mt-3 text-3xl font-bold text-foreground">{value}</div>
    </Card>
  );
}
