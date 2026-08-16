import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { sendPush } from "@/lib/push";
import { captureServerError } from "@/lib/posthog";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!title || title.length > 100) {
      return Response.json({ error: "Escribe un título (máximo 100 caracteres)" }, { status: 400 });
    }
    if (text.length > 200) {
      return Response.json({ error: "El mensaje es demasiado largo (máximo 200 caracteres)" }, { status: 400 });
    }

    const result = await sendPush({ title, body: text, url: url || undefined, tag: "admin" });
    return Response.json({ ok: true, sent: result.sent, removed: result.removed });
  } catch (err) {
    await captureServerError("api_error", {
      route: "/api/push/send",
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
