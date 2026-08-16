import { NextRequest } from "next/server";
import { getEvents } from "@/lib/db";
import { captureServerError } from "@/lib/posthog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const events = await getEvents({
      category: sp.get("categoria") ?? undefined,
      from: sp.get("desde") ?? undefined,
      to: sp.get("hasta") ?? undefined,
      q: sp.get("q") ?? undefined,
      limit: 100,
    });
    return Response.json({ count: events.length, events });
  } catch (err) {
    await captureServerError("api_error", {
      route: "/api/eventos",
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
