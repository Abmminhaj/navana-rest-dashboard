import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, PageHeader, StatusPill, buttonGhost } from "@/components/ui-kit";
import { type RoomStatus, type Room } from "@/lib/mock-data";
import { getRooms, updateRoom, resetRoomsToDefault, addRoom, deleteRoom } from "@/lib/room-storage";
import { X, BedDouble, Plus, RotateCcw, Trash2 } from "lucide-react";

export const Route = createFileRoute("/rooms")({
  head: () => ({ meta: [{ title: "Rooms — Navana Rest House" }] }),
  component: RoomsPage,
});

const ROOM_TYPE_PRESETS = ["Standard", "Deluxe", "Suite", "VIP"];

const statusStyles: Record<
  RoomStatus,
  {
    bg: string;
    dot: string;
    tone: "success" | "danger" | "warning" | "neutral";
  }
> = {
  Available: {
    bg: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
    dot: "bg-emerald-500",
    tone: "success",
  },
  Occupied: {
    bg: "bg-rose-50 border-rose-200 hover:border-rose-400",
    dot: "bg-rose-500",
    tone: "danger",
  },
  Cleaning: {
    bg: "bg-amber-50 border-amber-200 hover:border-amber-400",
    dot: "bg-amber-500",
    tone: "warning",
  },
  Maintenance: {
    bg: "bg-slate-100 border-slate-300 hover:border-slate-400",
    dot: "bg-slate-500",
    tone: "neutral",
  },
  Reserved: {
    bg: "bg-blue-50 border-blue-200 hover:border-blue-400",
    dot: "bg-blue-500",
    tone: "neutral",
  },
};

function RoomsPage() {
  const [filter, setFilter] = useState<RoomStatus | "All">("All");
  const [rooms, setRooms] = useState<Room[]>([]);

useEffect(() => {
  const loadRooms = () => {
    setRooms(getRooms());
  };

  loadRooms();

  window.addEventListener("roomsUpdated", loadRooms);

  return () => {
    window.removeEventListener("roomsUpdated", loadRooms);
  };
}, []);
  const [selected, setSelected] = useState<typeof rooms[number] | null>(null);
  const [editStatus, setEditStatus] = useState<RoomStatus>("Available");
  const [editType, setEditType] = useState("");
  const [customType, setCustomType] = useState(false);
  const [editRent, setEditRent] = useState(0);
  const [editAmenities, setEditAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [note, setNote] = useState("");

  function openRoom(r: Room) {
    setSelected(r);
    setEditStatus(r.status);
    setEditType(r.type);
    setCustomType(!ROOM_TYPE_PRESETS.includes(r.type));
    setEditRent(r.rent);
    setEditAmenities(r.amenities || []);
    setNewAmenity("");
    setNote(r.notes || "");
  }

  function addAmenity() {
    const trimmed = newAmenity.trim();
    if (!trimmed) return;
    if (!editAmenities.includes(trimmed)) {
      setEditAmenities([...editAmenities, trimmed]);
    }
    setNewAmenity("");
  }

  function removeAmenity(a: string) {
    setEditAmenities(editAmenities.filter((x) => x !== a));
  }

  const handleSaveRoom = () => {
  if (!selected) return;

  updateRoom(selected.number, {
    status: editStatus,
    type: editType.trim() || "Standard",
    rent: Number(editRent) || 0,
    amenities: editAmenities,
    notes: note,
  });

  setSelected(null);
};

  function handleDeleteRoom() {
    if (!selected) return;

    if (selected.status === "Occupied") {
      alert("এই Room-এ এখন Guest আছে। আগে Checkout করাও, তারপর Room Delete করতে পারবে।");
      return;
    }

    const ok = window.confirm(
      `Room ${selected.number} মুছে ফেলতে চাও? এই কাজ Undo করা যাবে না।`
    );
    if (!ok) return;

    deleteRoom(selected.number);
    setSelected(null);
  }

  function handleResetRooms() {
    const ok = window.confirm(
      "এটি বর্তমান সব Room-এর Status/Type/Amenities মুছে দিয়ে আসল ২৫টা Room (101-109, 201-216) দিয়ে নতুন করে শুরু করবে। আপনি কি নিশ্চিত?"
    );
    if (!ok) return;

    resetRoomsToDefault();
  }

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newFloor, setNewFloor] = useState(1);
  const [newType, setNewType] = useState("Standard");
  const [newCustomType, setNewCustomType] = useState(false);
  const [newRent, setNewRent] = useState(2500);
  const [addError, setAddError] = useState("");

  function handleAddRoom() {
    const number = newNumber.trim();
    if (!number) {
      setAddError("Room Number দিতে হবে");
      return;
    }

    try {
      addRoom({
        number,
        type: newType.trim() || "Standard",
        status: "Available",
        floor: Number(newFloor) || 1,
        rent: Number(newRent) || 0,
        amenities: [],
      });

      setShowAddRoom(false);
      setNewNumber("");
      setNewFloor(1);
      setNewType("Standard");
      setNewCustomType(false);
      setNewRent(2500);
      setAddError("");
    } catch {
      setAddError("এই Room Number আগে থেকেই আছে, অন্য একটা নম্বর দাও।");
    }
  }

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
      <PageHeader
        title="Rooms"
        description="Real-time inventory across all floors."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleResetRooms} className={buttonGhost}>
              <RotateCcw className="h-4 w-4" /> Reset to Default 25 Rooms
            </button>
            <button
              onClick={() => setShowAddRoom(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Add Room
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total Rooms" value={summary.total} accent="bg-primary-soft text-primary" />
        <Stat label="Occupied" value={summary.Occupied} accent="bg-rose-50 text-rose-700" />
        <Stat label="Available" value={summary.Available} accent="bg-emerald-50 text-emerald-700" />
        <Stat label="Maintenance" value={summary.Maintenance} accent="bg-slate-100 text-slate-700" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["All", "Available", "Occupied", "Reserved", "Cleaning", "Maintenance"] as const).map((f) => (
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
                    onClick={() => openRoom(r)}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Room Type</label>
                  <select
                    value={customType ? "__custom__" : editType}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setCustomType(true);
                        setEditType("");
                      } else {
                        setCustomType(false);
                        setEditType(e.target.value);
                      }
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  >
                    {ROOM_TYPE_PRESETS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="__custom__">Custom (নিজে লিখুন)</option>
                  </select>
                  {customType && (
                    <input
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      placeholder="Room Type লিখো"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nightly Rate (৳)</label>
                  <input
                    type="number"
                    value={editRent}
                    onChange={(e) => setEditRent(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
  <label className="text-sm font-medium text-foreground">
    Room Status
  </label>

  <select
    value={editStatus}
    onChange={(e) =>
      setEditStatus(e.target.value as RoomStatus)
    }
    className="w-full rounded-lg border border-border bg-background px-3 py-2"
  >
    <option value="Available">Available</option>
    <option value="Occupied">Occupied</option>
    <option value="Reserved">Reserved</option>
    <option value="Cleaning">Cleaning</option>
    <option value="Maintenance">Maintenance</option>
  </select>
</div>
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">
    Notes
  </label>

  <textarea
    value={note}
    onChange={(e) => setNote(e.target.value)}
    rows={3}
    placeholder="Write any note..."
    className="w-full rounded-lg border border-border bg-background px-3 py-2"
  />
</div>
              <div>
                <label className="text-sm font-medium text-foreground">Amenities / Facilities</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {editAmenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      {a}
                      <button
                        type="button"
                        onClick={() => removeAmenity(a)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {editAmenities.length === 0 && (
                    <span className="text-xs text-muted-foreground">এখনো কোনো Amenity যোগ করা হয়নি</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAmenity();
                      }
                    }}
                    placeholder="e.g. AC, Wi-Fi, Balcony"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border px-6 py-4">

  <button
    onClick={handleDeleteRoom}
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
  >
    <Trash2 className="h-4 w-4" /> Delete Room
  </button>

  <div className="flex gap-2">
    <button
      onClick={() => setSelected(null)}
      className={buttonGhost}
    >
      Close
    </button>

    <button
      onClick={handleSaveRoom}
      className="rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:opacity-90"
    >
      Save Changes
    </button>
  </div>

</div>
          </div>
        </div>
      )}

      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-bold text-foreground">Add New Room</h3>
              <button
                onClick={() => setShowAddRoom(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Room Number</label>
                <input
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="e.g. 217"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Floor</label>
                  <input
                    type="number"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nightly Rate (৳)</label>
                  <input
                    type="number"
                    value={newRent}
                    onChange={(e) => setNewRent(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Room Type</label>
                <select
                  value={newCustomType ? "__custom__" : newType}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setNewCustomType(true);
                      setNewType("");
                    } else {
                      setNewCustomType(false);
                      setNewType(e.target.value);
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                >
                  {ROOM_TYPE_PRESETS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="__custom__">Custom (নিজে লিখুন)</option>
                </select>
                {newCustomType && (
                  <input
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="Room Type লিখো"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                )}
              </div>
              {addError && <p className="text-xs text-red-600">{addError}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => setShowAddRoom(false)} className={buttonGhost}>
                Cancel
              </button>
              <button
                onClick={handleAddRoom}
                className="rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Add Room
              </button>
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
