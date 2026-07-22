const STORAGE_KEY = "navana_notification_log";
const MAX_ENTRIES = 50;

export interface NotificationLogEntry {
  id: string;
  title: string;
  body: string;
  time: string; // ISO timestamp
  read: boolean;
}

export function getNotificationLog(): NotificationLogEntry[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

function saveNotificationLog(list: NotificationLogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  refreshNotificationLog();
}

export function addNotificationLogEntry(entry: { title: string; body: string }) {
  const list = getNotificationLog();
  const newEntry: NotificationLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: entry.title,
    body: entry.body,
    time: new Date().toISOString(),
    read: false,
  };

  const updated = [newEntry, ...list].slice(0, MAX_ENTRIES);
  saveNotificationLog(updated);
}

export function markAllRead() {
  const updated = getNotificationLog().map((n) => ({ ...n, read: true }));
  saveNotificationLog(updated);
}

export function markRead(id: string) {
  const updated = getNotificationLog().map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotificationLog(updated);
}

export function getUnreadCount(): number {
  return getNotificationLog().filter((n) => !n.read).length;
}

export function refreshNotificationLog() {
  window.dispatchEvent(new Event("notificationLogUpdated"));
}
