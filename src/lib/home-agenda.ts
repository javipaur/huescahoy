import { displayDate } from "./agenda-dates";
import { dayNumber, dayShort, monthShort, parseDate } from "./format";
import type { Category, EventItem } from "./types";

export const FINDE = "finde";

export type DayTab = {
  value: string;
  label: string;
};

const MAX_DAY_TABS = 7;

export function shiftDate(iso: string, days: number): string {
  const date = parseDate(iso);
  date.setDate(date.getDate() + days);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function weekendRange(today: string): { from: string; to: string } {
  const dow = parseDate(today).getDay();
  if (dow === 6) return { from: today, to: shiftDate(today, 1) };
  const daysToSat = (6 - dow + 7) % 7;
  return { from: shiftDate(today, daysToSat), to: shiftDate(today, daysToSat + 1) };
}

export function dayLabel(date: string, today: string): string {
  if (date === today) return "Hoy";
  if (date === shiftDate(today, 1)) return "Mañana";
  const label = `${dayShort(date)} ${dayNumber(date)}`;
  const d = parseDate(date);
  const t = parseDate(today);
  return d.getMonth() !== t.getMonth() || d.getFullYear() !== t.getFullYear()
    ? `${label} ${monthShort(date)}`
    : label;
}

export function dayTabs(events: EventItem[], today: string): DayTab[] {
  const tabs: DayTab[] = [
    { value: today, label: "Hoy" },
    { value: shiftDate(today, 1), label: "Mañana" },
  ];
  const seen = new Set(tabs.map((tab) => tab.value));
  const datesWithEvents = events
    .map((event) => displayDate(event, today))
    .filter((date) => date >= today && !seen.has(date))
    .sort();
  for (const date of new Set(datesWithEvents)) {
    if (tabs.length >= MAX_DAY_TABS) break;
    tabs.push({ value: date, label: dayLabel(date, today) });
  }
  return tabs;
}

export function isFinde(day: string): boolean {
  return day === FINDE;
}

export function findeLabel(today: string): string {
  const { from, to } = weekendRange(today);
  const label = (iso: string) => `${dayShort(iso)} ${dayNumber(iso)} ${monthShort(iso)}`;
  return `${label(from)} – ${label(to)}`;
}

export function agendaEventsFor(
  events: EventItem[],
  day: string,
  categorySlug: string,
  categories: Category[],
  today: string
): EventItem[] {
  const catId = categories.find((category) => category.slug === categorySlug)?.id;
  const inDay = (event: EventItem): boolean => {
    if (isFinde(day)) {
      const { from, to } = weekendRange(today);
      const startsBeforeTo = event.startDate <= to;
      const endsOnOrAfterFrom = event.endDate ? event.endDate >= from : event.startDate >= from;
      return startsBeforeTo && endsOnOrAfterFrom;
    }
    return displayDate(event, today) === day;
  };
  return events
    .filter((event) => {
      if (catId && event.categoryId !== catId) return false;
      return inDay(event);
    })
    .sort((a, b) => {
      const ta = a.startTime ?? "99:99";
      const tb = b.startTime ?? "99:99";
      if (ta !== tb) return ta < tb ? -1 : 1;
      return a.title.localeCompare(b.title, "es");
    });
}