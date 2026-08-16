"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellRing, BellOff } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

type Status = "checking" | "idle" | "subscribing" | "subscribed" | "denied" | "error";

export function PushSubscribeButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [status, setStatus] = useState<Status>("checking");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = async () => {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !VAPID_PUBLIC_KEY
      ) {
        setSupported(false);
        setStatus("error");
        return;
      }
      setSupported(true);
      const permission = Notification.permission;
      if (permission === "denied") {
        setStatus("denied");
        return;
      }
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setStatus(subscription ? "subscribed" : "idle");
        return;
      }
      setStatus("idle");
    };
    void check();
  }, []);

  const subscribe = useCallback(async () => {
    setStatus("subscribing");
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY as string),
        });
      }
      const json = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error("No se pudo guardar la suscripción");
      setStatus("subscribed");
    } catch (err) {
      console.error("Error activando notificaciones", err);
      if (Notification.permission === "denied") setStatus("denied");
      else setStatus("error");
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setStatus("subscribing");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setStatus("idle");
    } catch (err) {
      console.error("Error desactivando notificaciones", err);
      setStatus("error");
    }
  }, []);

  const busy = status === "checking" || status === "subscribing";

  if (status === "error" && !supported) return null;

  if (status === "denied") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cream/50">
        <BellOff className="h-4 w-4" />
        Avisos bloqueados en el navegador
      </span>
    );
  }

  const subscribed = status === "subscribed";
  const base =
    tone === "dark"
      ? subscribed
        ? "border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
        : "border border-white/15 bg-white/5 text-cream hover:border-gold/40 hover:text-gold"
      : subscribed
        ? "border border-brand/30 bg-brand/10 text-brand hover:bg-brand/20"
        : "border border-brand/20 bg-white text-brand hover:bg-brand/5";

  return (
    <button
      type="button"
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={busy || status === "error"}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${base}`}
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : subscribed ? (
        <BellRing className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {busy
        ? "Comprobando..."
        : subscribed
          ? "Avisos activados"
          : status === "error"
            ? "No disponible"
            : "Activar avisos"}
    </button>
  );
}
