import { NextRequest } from "next/server";
import { runAllSources } from "@/lib/scraper/run";
import { captureServerError } from "@/lib/posthog";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const result = await runAllSources();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    await captureServerError("api_error", {
      route: "/api/cron/scrape",
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}