import { Link } from "@tanstack/react-router";
import { Bell, Search, Hotel, ChevronDown } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/booking", label: "Booking" },
  { to: "/checkout", label: "Check Out" },
  { to: "/customers", label: "Customer Information" },
  { to: "/rooms", label: "Rooms" },
  { to: "/expenses", label: "Expenses" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
] as const;

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Hotel className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-foreground">NAVANA REST HOUSE</div>
              <div className="text-[11px] font-medium text-muted-foreground">Hotel Management System</div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="relative hidden md:block w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customer, phone, room, NID…"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">3</span>
            </button>

            <button className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background pl-1 pr-3 hover:bg-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">AR</div>
              <div className="text-left leading-tight">
                <div className="text-xs font-semibold text-foreground">Arif Rahman</div>
                <div className="text-[10px] text-muted-foreground">Administrator</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto pb-px">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="relative whitespace-nowrap px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
              activeProps={{
                className:
                  "relative whitespace-nowrap px-4 py-3 text-sm font-semibold text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
