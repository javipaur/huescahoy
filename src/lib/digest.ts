import { getEvents, getPushMeta, setPushMeta, todayStr } from "./db";
import { pushConfigured, sendPush } from "./push";

export type DigestResult = {
  status: "sent" | "already_sent" | "nothing_to_send" | "not_configured";
  events: number;
  sent: number;
};

export async function sendDailyDigest(): Promise<DigestResult> {
  if (!pushConfigured()) return { status: "not_configured", events: 0, sent: 0 };

  const today = todayStr();
  if ((await getPushMeta("last_digest_sent")) === today) {
    return { status: "already_sent", events: 0, sent: 0 };
  }

  const events = await getEvents({ from: today, to: todayStr(3), limit: 8 });
  if (events.length === 0) {
    await setPushMeta("last_digest_sent", today);
    return { status: "nothing_to_send", events: 0, sent: 0 };
  }

  const allToday = events.every((event) => event.startDate === today);
  const title = allToday
    ? events.length === 1
      ? "Hay algo hoy en Huesca"
      : `${events.length} eventos hoy en Huesca`
    : events.length === 1
      ? "Un evento para estos días"
      : `${events.length} eventos para estos días`;

  const shown = events.slice(0, 4).map((event) => event.title);
  const more = events.length > 4 ? ` · y ${events.length - 4} más` : "";
  const result = await sendPush(
    { title, body: shown.join(" · ") + more, url: "/agenda?desde=hoy", tag: "digest" },
    { url: "/agenda?desde=hoy", tag: "digest" }
  );

  await setPushMeta("last_digest_sent", today);
  return { status: "sent", events: events.length, sent: result.sent };
}
