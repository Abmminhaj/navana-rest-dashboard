import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui-kit";

interface Stay {
  id: string;
  room: string;
  customer: string;
  remaining: number;
}

interface Props {
  activeStays: Stay[];
}

export default function PendingCheckout({ activeStays }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-sm font-semibold">Pending Check Outs</h2>

        <Link
          to="/checkout"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <ul className="divide-y divide-border">
        {activeStays.slice(0, 5).map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-6 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary">
              {s.room}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">
                {s.customer}
              </div>

              <div className="text-[11px] text-muted-foreground">
                Remaining ৳{s.remaining.toLocaleString()}
              </div>
            </div>

            <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              Checkout
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}