import { Card, SectionTitle } from "@/components/ui-kit";

type Activity = {
  text: string;
  time: string;
  tone: "success" | "warning" | "info" | "neutral";
};

type Props = {
  activities: Activity[];
};

export default function RecentActivity({ activities }: Props) {
  return (
    <Card>
      <SectionTitle title="Recent Activity" />

      <ul className="divide-y divide-border">
        {activities.map((a, i) => (
          <li key={i} className="px-6 py-3">
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  a.tone === "success"
                    ? "bg-emerald-500"
                    : a.tone === "warning"
                    ? "bg-amber-500"
                    : a.tone === "info"
                    ? "bg-blue-500"
                    : "bg-slate-400"
                }`}
              />

              <div className="min-w-0">
                <div className="text-sm text-foreground">
                  {a.text}
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {a.time}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}