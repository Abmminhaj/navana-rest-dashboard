import { getActiveStays } from "./stay-storage";
import { getRooms } from "./room-storage";
import { getNotificationPrefs } from "./settings-storage";
import { addNotificationLogEntry } from "./notification-log-storage";

const NOTIFIED_CHECKOUTS_KEY = "navana_notified_checkouts";
const LAST_DAILY_SUMMARY_KEY = "navana_last_daily_summary";

function getNotifiedCheckouts(): string[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_CHECKOUTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function markCheckoutNotified(id: string) {
  const list = getNotifiedCheckouts();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(NOTIFIED_CHECKOUTS_KEY, JSON.stringify(list));
  }
}

function canNotify() {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

function fireNotification(title: string, body: string) {
  // Always record it in the in-app bell dropdown — this works even if the
  // browser has notifications blocked, so nothing gets silently missed.
  addNotificationLogEntry({ title, body });

  if (!canNotify()) return;
  try {
    new Notification(title, { body });
  } catch {
    // Some browsers throw if called from a background tab/service worker context — safe to ignore
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "default") {
    return Notification.requestPermission();
  }
  return Notification.permission;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  return Notification.permission;
}

function checkPendingCheckouts() {
  const prefs = getNotificationPrefs();
  if (!prefs.pendingCheckoutAlerts) return;

  const notified = getNotifiedCheckouts();
  const now = Date.now();
  const stays = getActiveStays();

  stays.forEach((stay: any) => {
    if (notified.includes(stay.id)) return;

    const t = new Date(String(stay.expectedCheckOut).replace(" ", "T")).getTime();
    if (Number.isNaN(t)) return;

    const minutesLeft = (t - now) / 60000;
    if (minutesLeft <= 60 && minutesLeft > -60) {
      fireNotification(
        "Checkout Due Soon",
        `${stay.customer} — Room ${stay.room} checkout is due around ${stay.expectedCheckOut}.`
      );
      markCheckoutNotified(stay.id);
    }
  });
}

function checkDailySummary() {
  const prefs = getNotificationPrefs();
  if (!prefs.lowOccupancyAlerts) return;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const lastFired = localStorage.getItem(LAST_DAILY_SUMMARY_KEY);
  if (lastFired === todayStr) return;
  if (now.getHours() < 9) return;

  const rooms = getRooms();
  const occupied = rooms.filter((r: any) => r.status === "Occupied").length;
  const total = rooms.length || 1;
  const occupancyPct = Math.round((occupied / total) * 100);

  fireNotification(
    "Daily Occupancy Summary",
    `${occupied}/${total} rooms occupied (${occupancyPct}%) today.`
  );
  localStorage.setItem(LAST_DAILY_SUMMARY_KEY, todayStr);
}

let intervalId: number | null = null;

// Call once from a globally-mounted component (e.g. __root.tsx) so it keeps
// checking in the background no matter which page the user is on.
export function startNotificationEngine() {
  if (typeof window === "undefined") return;
  if (intervalId !== null) return; // already running

  checkPendingCheckouts();
  checkDailySummary();

  intervalId = window.setInterval(() => {
    checkPendingCheckouts();
    checkDailySummary();
  }, 60 * 1000);
}

export function stopNotificationEngine() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
