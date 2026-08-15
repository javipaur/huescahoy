export type Reminder = {
  eventId: number;
  title: string;
  slug: string;
  image: string | null;
  startDate: string;
  startTime: string | null;
  location: string | null;
  triggerAt: string;
  fired: boolean;
};

export type ReminderOffset = {
  ms: number;
  label: string;
};

export const REMINDER_OFFSETS: ReminderOffset[] = [
  { ms: 60 * 60 * 1000, label: "1 hora antes" },
  { ms: 3 * 60 * 60 * 1000, label: "3 horas antes" },
  { ms: 24 * 60 * 60 * 1000, label: "1 día antes" },
];

const KEY = "huescahoy:reminders";

const listeners = new Set<() => void>();
let snapshotCache: Record<number, Reminder> | null = null;

function notify(): void {
  snapshotCache = null;
  for (const listener of listeners) listener();
}

export function subscribeReminders(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRemindersSnapshot(): Record<number, Reminder> {
  if (snapshotCache === null) snapshotCache = loadReminders();
  return snapshotCache;
}

function startAtDate(startDate: string, startTime: string | null): Date {
  return new Date(`${startDate}T${startTime ?? "12:00"}:00`);
}

export function triggerAtFor(
  startDate: string,
  startTime: string | null,
  offsetMs: number
): string {
  return new Date(startAtDate(startDate, startTime).getTime() - offsetMs).toISOString();
}

export function isTriggerInPast(triggerAt: string): boolean {
  return new Date(triggerAt).getTime() <= Date.now();
}

export function loadReminders(): Record<number, Reminder> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, Reminder>;
  } catch {
    return {};
  }
}

function saveReminders(reminders: Record<number, Reminder>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(reminders));
  } catch {
    // almacenamiento no disponible; el aviso simplemente no se guarda
  }
}

export function getReminder(eventId: number): Reminder | undefined {
  return loadReminders()[eventId];
}

export function setReminder(reminder: Reminder): void {
  const reminders = loadReminders();
  reminders[reminder.eventId] = reminder;
  saveReminders(reminders);
  notify();
}

export function removeReminder(eventId: number): void {
  const reminders = loadReminders();
  delete reminders[eventId];
  saveReminders(reminders);
  notify();
}

function reminderBody(reminder: Reminder): string {
  const time = reminder.startTime ? `Empieza a las ${reminder.startTime}` : "Empieza hoy";
  return reminder.location ? `${time} · ${reminder.location}` : time;
}

export function fireDueReminders(): number {
  if (typeof window === "undefined" || !("Notification" in window)) return 0;
  const reminders = loadReminders();
  const now = Date.now();
  let fired = 0;
  for (const reminder of Object.values(reminders)) {
    if (reminder.fired) continue;
    if (new Date(reminder.triggerAt).getTime() > now) continue;
    new Notification(reminder.title, {
      body: reminderBody(reminder),
      icon: reminder.image ?? "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: `huescahoy-${reminder.eventId}`,
      data: { url: `/eventos/${reminder.slug}` },
    });
    reminder.fired = true;
    fired++;
  }
  if (fired > 0) {
    saveReminders(reminders);
    notify();
  }
  return fired;
}
