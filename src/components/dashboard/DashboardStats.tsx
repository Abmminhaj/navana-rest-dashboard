import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui-kit";

export interface StatItem {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  tone: string;
}

interface Props {
  stats: StatItem[];
}

export default function DashboardStats({ stats }: Props) {
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
