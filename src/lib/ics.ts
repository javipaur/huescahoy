import type { EventItem } from "./types";

export function gcalTimestamp(iso: string, time: string | null): string {
  if (time) {
    const [y, m, d] = iso.split("-");
    const [h, min] = time.split(":");
    return `${y}${m}${d}T${h}${min}00`;
  }
  return iso.split("-").join("");
}

export function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildEventIcs(event: EventItem): string {
  const start = gcalTimestamp(event.startDate, event.startTime);
  const endIso = event.endDate ?? event.startDate;
  const end = event.endTime
    ? gcalTimestamp(endIso, event.endTime)
    : event.startTime
      ? gcalTimestamp(event.startDate, event.startTime)
      : endIso.split("-").join("");
  const allDay = !event.startTime;

  const stamp = new Date(event.updatedAt)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
    .slice(0, 15) + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HuescaHoy//ES//EN",
    "BEGIN:VEVENT",
    `UID:${event.slug}@huescahoy`,
    `DTSTAMP:${stamp}`,
    allDay
      ? `DTSTART;VALUE=DATE:${gcalTimestamp(event.startDate, null)}`
      : `DTSTART:${start}`,
    allDay ? `DTEND;VALUE=DATE:${gcalTimestamp(endIso, null)}` : `DTEND:${end}`,
    `SUMMARY:${icsEscape(event.title)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${icsEscape(event.description)}`);
  if (event.location) lines.push(`LOCATION:${icsEscape(event.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function buildAgendaIcs(events: EventItem[]): string {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HuescaHoy//ES//EN",
    "X-WR-CALNAME:Agenda HuescaHoy",
    "X-WR-TIMEZONE:Europe/Madrid",
  ];
  const footer = ["END:VCALENDAR"];
  const vevents = events.map((event) => {
    const lines = buildEventIcs(event).split("\r\n");
    return lines.slice(lines.indexOf("BEGIN:VEVENT"), lines.indexOf("END:VEVENT") + 1).join("\r\n");
  });
  return [...header, ...vevents, ...footer].join("\r\n");
}

export function gcalEventUrl(event: EventItem): string {
  const start = gcalTimestamp(event.startDate, event.startTime);
  const endIso = event.endDate ?? event.startDate;
  const end = event.endTime ? gcalTimestamp(endIso, event.endTime) : start;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description ?? "",
    location: event.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
