"use client";

import { useState, useSyncExternalStore } from "react";
import { Bell, BellRing, Check, Clock } from "lucide-react";
import type { EventItem } from "@/lib/types";
import {
  REMINDER_OFFSETS,
  getRemindersSnapshot,
  isTriggerInPast,
  removeReminder,
  setReminder,
  subscribeReminders,
  triggerAtFor,
  type ReminderOffset,
} from "@/lib/reminders";

const emptySubscribe = () => () => {};

export function RemindButton({ event }: { event: EventItem }) {
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  const supported = useSyncExternalStore(
    emptySubscribe,
    () => "Notification" in window,
    () => false
  );

  const reminders = useSyncExternalStore(subscribeReminders, getRemindersSnapshot);
  const reminder = reminders[event.id];
  const active = Boolean(reminder);
  const savedOffset: ReminderOffset | null = active
    ? REMINDER_OFFSETS.find(
        (offset) =>
          triggerAtFor(event.startDate, event.startTime, offset.ms) ===
          reminder.triggerAt
      ) ?? null
    : null;

  if (!supported) return null;

  function choose(offset: ReminderOffset) {
    setReminder({
      eventId: event.id,
      title: event.title,
      slug: event.slug,
      image: event.image,
      startDate: event.startDate,
      startTime: event.startTime,
      location: event.location,
      triggerAt: triggerAtFor(event.startDate, event.startTime, offset.ms),
      fired: false,
    });
    setOpen(false);
  }

  function cancel() {
    removeReminder(event.id);
    setOpen(false);
  }

  async function toggleMenu() {
    if (Notification.permission === "denied") {
      setDenied(true);
      setOpen(false);
      return;
    }
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setDenied(true);
        return;
      }
    }
    setDenied(false);
    setOpen((value) => !value);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={toggleMenu}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
          active
            ? "border-choco bg-choco text-cream hover:bg-choco/90"
            : "border-choco/20 bg-white text-choco hover:border-choco/40"
        }`}
        aria-expanded={open}
      >
        {active ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {active ? "Avísame activado" : "Avísame"}
      </button>

      {denied && (
        <p className="mt-1 text-xs text-red-600">
          Notificaciones bloqueadas. Actívalas desde los ajustes del navegador.
        </p>
      )}

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-sand bg-white p-2 shadow-xl">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Recibir un aviso
          </p>
          {REMINDER_OFFSETS.map((offset) => {
            const triggerAt = triggerAtFor(
              event.startDate,
              event.startTime,
              offset.ms
            );
            const past = isTriggerInPast(triggerAt);
            const selected = active && savedOffset?.ms === offset.ms;
            return (
              <button
                key={offset.ms}
                type="button"
                disabled={past}
                onClick={() => choose(offset)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  past
                    ? "cursor-not-allowed text-choco-muted/50"
                    : "text-choco hover:bg-sand"
                }`}
              >
                <Clock className="h-4 w-4 shrink-0 text-choco-muted" />
                <span className="flex-1">{offset.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0 text-brand" />}
              </button>
            );
          })}
          {active && (
            <>
              <div className="my-1 border-t border-sand" />
              <button
                type="button"
                onClick={cancel}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                Quitar el aviso
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
