import webPush from "web-push";
import {
  countPushSubscriptions,
  deletePushSubscriptionByEndpoint,
  getPushSubscriptions,
} from "./db";
import { captureServerError } from "./posthog";
import { site } from "./site";

type PushPayload = {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
};

function getVapidKeys(): {
  subject: string;
  publicKey: string;
  privateKey: string;
} | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? `mailto:hola@${new URL(site.url).hostname}`;
  if (!publicKey || !privateKey) return null;
  return { subject, publicKey, privateKey };
}

export function pushConfigured(): boolean {
  return getVapidKeys() !== null;
}

export async function sendPush(
  payload: PushPayload,
  opts?: { url?: string; tag?: string }
): Promise<{ sent: number; removed: number }> {
  const keys = getVapidKeys();
  if (!keys) return { sent: 0, removed: 0 };

  webPush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);

  const subscriptions = await getPushSubscriptions();
  if (subscriptions.length === 0) return { sent: 0, removed: 0 };

  const url = opts?.url ?? payload.url ?? site.url;
  const tag = opts?.tag ?? payload.tag ?? "huescahoy";
  const data = JSON.stringify({ title: payload.title, body: payload.body ?? "", url, tag });

  let sent = 0;
  let removed = 0;
  for (const sub of subscriptions) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keysP256dh, auth: sub.keysAuth },
    };
    try {
      await webPush.sendNotification(subscription, data);
      sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/410|404|gone|no longer/i.test(message)) {
        await deletePushSubscriptionByEndpoint(sub.endpoint);
        removed++;
      } else {
        await captureServerError("push_error", {
          endpoint: sub.endpoint.slice(0, 80),
          error: message,
        });
      }
    }
  }
  return { sent, removed };
}

export async function sendPushToAll(
  title: string,
  body: string,
  url?: string
): Promise<{ sent: number; removed: number }> {
  return sendPush({ title, body, url });
}

export async function pushSubscriberCount(): Promise<number> {
  if (!pushConfigured()) return 0;
  return countPushSubscriptions();
}
