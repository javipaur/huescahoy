"use client";

import { useEffect } from "react";
import { fireDueReminders } from "@/lib/reminders";

export function ReminderChecker() {
  useEffect(() => {
    fireDueReminders();

    const onVisibilityChange = () => {
      if (!document.hidden) fireDueReminders();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const interval = window.setInterval(fireDueReminders, 60_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
