import { getEvents, todayStr } from "@/lib/db";
import { buildEventsRss } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await getEvents({ from: todayStr(), limit: 50 });
  const xml = buildEventsRss(events);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
    },
  });
}
