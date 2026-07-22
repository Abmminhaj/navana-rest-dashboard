import { useEffect } from "react";
import { startNotificationEngine, stopNotificationEngine } from "@/lib/notification-engine";

// Mount this once near the top of your root layout (src/routes/__root.tsx),
// e.g. right beside <TopNav />. It renders nothing — it just keeps the
// background checker (pending checkouts, daily summary) running.
export default function NotificationEngine() {
  useEffect(() => {
    startNotificationEngine();
    return () => stopNotificationEngine();
  }, []);

  return null;
}
