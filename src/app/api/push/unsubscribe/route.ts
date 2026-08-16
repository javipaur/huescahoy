import { NextRequest } from "next/server";
import { deletePushSubscriptionByEndpoint } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
    if (!endpoint) {
      return Response.json({ error: "Falta el endpoint" }, { status: 400 });
    }
    await deletePushSubscriptionByEndpoint(endpoint);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
