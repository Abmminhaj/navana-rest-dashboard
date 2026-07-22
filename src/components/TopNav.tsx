import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Search, Hotel, ChevronDown } from "lucide-react";
import { getNotificationLog, markAllRead, markRead, type NotificationLogEntry } from "@/lib/notification-log-storage";
import { getAdminFullName } from "@/lib/settings-storage";

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

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<NotificationLogEntry[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  function load() {
    setLog(getNotificationLog());
  }

  useEffect(() => {
    load();
    window.addEventListener("notificationLogUpdated", load);
    return () => window.removeEventListener("notificationLogUpdated", load);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = log.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {log.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                কোনো Notification নেই
              </div>
            ) : (
              log.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`block w-full border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted/40 ${
                    n.read ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-foreground">{n.title}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{n.body}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{timeAgo(n.time)}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopNav({ className = "" }: { className?: string }) {
  const [adminName, setAdminName] = useState("Arif Rahman");

  useEffect(() => {
    function loadAdmin() {
      setAdminName(getAdminFullName() || "Arif Rahman");
    }
    loadAdmin();
    window.addEventListener("settingsUpdated", loadAdmin);
    return () => window.removeEventListener("settingsUpdated", loadAdmin);
  }, []);

  return (
    <header className={"sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur " + className}>
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

            <NotificationBell />

            <button className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background pl-1 pr-3 hover:bg-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                {adminName.split(" ").map((p) => p[0]).join("")}
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-semibold text-foreground">{adminName}</div>
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
