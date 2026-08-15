import { NextRequest } from "next/server";
import { getEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const events = getEvents({
    category: sp.get("categoria") ?? undefined,
    from: sp.get("desde") ?? undefined,
    to: sp.get("hasta") ?? undefined,
    q: sp.get("q") ?? undefined,
    limit: 100,
  });
  return Response.json({ count: events.length, events });
}
