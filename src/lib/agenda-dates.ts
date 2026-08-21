import type { EventItem } from "./types";

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}

export function rangeFrom(desde: string): { from?: string; to?: string } {
  const today = toDateStr(new Date());
  if (desde === "hoy") return { from: today, to: today };
  if (desde === "7d") return { from: today, to: addDays(7) };
  if (desde === "mes") {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: today, to: toDateStr(lastDay) };
  }
  if (desde === "finde") {
    const day = new Date().getDay();
    if (day === 6) return { from: today, to: addDays(1) };
    const daysToSat = ((6 - day) + 7) % 7;
    return { from: addDays(daysToSat), to: addDays(daysToSat + 1) };
  }
  return { from: today };
}

export function displayDate(event: EventItem, today: string): string {
  if (event.startDate < today && event.endDate && event.endDate >= today) {
    return today;
  }
  return event.startDate;
}
