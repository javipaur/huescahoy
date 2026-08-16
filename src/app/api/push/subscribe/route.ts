import { NextRequest } from "next/server";
import { upsertPushSubscription } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
    const keysP256dh = typeof body?.keys?.p256dh === "string" ? body.keys.p256dh : "";
    const keysAuth = typeof body?.keys?.auth === "string" ? body.keys.auth : "";

    if (!endpoint.startsWith("https://") || !keysP256dh || !keysAuth) {
      return Response.json({ error: "Suscripción no válida" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent");
    await upsertPushSubscription({ endpoint, keysP256dh, keysAuth, userAgent });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
