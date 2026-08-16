import { getEvents, todayStr } from "@/lib/db";
import { buildAgendaIcs } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await getEvents({
    from: todayStr(),
    to: todayStr(7),
    limit: 100,
  });
  const ics = buildAgendaIcs(events);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="agenda-huescahoy.ics"',
      "Cache-Control": "no-store",
    },
  });
}
