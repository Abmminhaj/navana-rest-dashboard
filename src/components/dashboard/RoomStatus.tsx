import { Card } from "@/components/ui-kit";

interface Room {
  number: string;
  type: string;
  status: string;
}

interface Props {
  rooms: Room[];
  statusColor: Record<string, string>;
}

function Legend({
  swatch,
  label,
}: {
  swatch: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${swatch}`} />
      <span>{label}</span>
    </div>
  );
}

export default function RoomStatus({ rooms, statusColor }: Props) {
  return (
    <Card className="xl:col-span-2">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-sm font-semibold">Room Status Overview</h2>

        <div className="flex items-center gap-3 text-[11px]">
          <Legend swatch="bg-emerald-500" label="Available" />
          <Legend swatch="bg-rose-500" label="Occupied" />
          <Legend swatch="bg-amber-500" label="Cleaning" />
          <Legend swatch="bg-slate-400" label="Maintenance" />
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {rooms.map((r) => (
            <div
              key={r.number}
              className={`rounded-xl border px-3 py-3 transition hover:scale-[1.02] ${statusColor[r.status]}`}
            >
              <div className="text-lg font-bold">{r.number}</div>

              <div className="mt-1 text-[10px] uppercase opacity-80">
                {r.type}
              </div>

              <div className="mt-2 text-[11px] font-semibold">
                {r.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}