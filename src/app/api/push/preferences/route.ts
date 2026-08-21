import { NextRequest } from "next/server";
import { setPushCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
    if (!endpoint.startsWith("https://")) {
      return Response.json({ error: "Suscripción no válida" }, { status: 400 });
    }

    const raw: unknown[] = Array.isArray(body?.categories) ? body.categories : [];
    const categories = [
      ...new Set(
        raw.filter((c): c is string => typeof c === "string" && /^[a-z0-9-]{1,40}$/.test(c))
      ),
    ].slice(0, 20);

    const updated = await setPushCategories(endpoint, categories);
    if (!updated) {
      return Response.json({ error: "No hay suscripción activa" }, { status: 404 });
    }
    return Response.json({ ok: true, categories });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
