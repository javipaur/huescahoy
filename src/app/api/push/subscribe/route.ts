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

    const rawCategories: unknown[] = Array.isArray(body?.categories) ? body.categories : [];
    const categories = [
      ...new Set(
        rawCategories.filter(
          (c): c is string => typeof c === "string" && /^[a-z0-9-]{1,40}$/.test(c)
        )
      ),
    ].slice(0, 20);

    const userAgent = request.headers.get("user-agent");
    await upsertPushSubscription({ endpoint, keysP256dh, keysAuth, userAgent, categories });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
