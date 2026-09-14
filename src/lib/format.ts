const SHORT_DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const SHORT_MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const LONG_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dayShort(iso: string): string {
  return SHORT_DAYS[parseDate(iso).getDay()];
}

export function dayNumber(iso: string): number {
  return parseDate(iso).getDate();
}

export function monthShort(iso: string): string {
  return SHORT_MONTHS[parseDate(iso).getMonth()];
}

export function formatDayShort(iso: string): string {
  const date = parseDate(iso);
  return `${SHORT_DAYS[date.getDay()]} ${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

export function formatDayLong(iso: string): string {
  const date = parseDate(iso);
  return `${SHORT_DAYS[date.getDay()]}, ${date.getDate()} de ${LONG_MONTHS[date.getMonth()]}`;
}

export function formatMonthYear(iso: string): string {
  const date = parseDate(iso);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${m}/${y}`;
}

export function formatDateRange(
  startDate: string,
  endDate: string | null,
  startTime?: string | null,
  endTime?: string | null
): string {
  if (endDate && endDate !== startDate) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    return `${SHORT_DAYS[start.getDay()]} ${start.getDate()} ${SHORT_MONTHS[start.getMonth()]} - ${SHORT_DAYS[end.getDay()]} ${end.getDate()} ${SHORT_MONTHS[end.getMonth()]}`;
  }
  const base = formatDayShort(startDate);
  if (startTime) {
    const time = endTime ? `${startTime}-${endTime}` : startTime;
    return `${base} · ${time}`;
  }
  return base;
}

export function formatTimeRange(
  startTime: string | null,
  endTime: string | null
): string | null {
  if (!startTime) return null;
  return endTime ? `${startTime}-${endTime}` : startTime;
}

export function timeTo12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "p. m." : "a. m.";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
