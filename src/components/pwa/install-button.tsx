"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const TONES = {
  solid: "bg-choco text-cream hover:bg-choco/90",
  outline:
    "border border-brand/30 bg-white text-brand hover:border-brand/60 hover:bg-brand/5",
  light: "bg-white text-choco hover:bg-gold/40",
} as const;

export function InstallButton({ tone = "solid" }: { tone?: keyof typeof TONES }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const timer = window.setTimeout(() => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setInstalled(true);
        return;
      }
      setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    }, 0);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.clearTimeout(timer);
    };
  }, []);

  if (installed) return null;

  async function handleInstall() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else if (isIos) {
      setShowIosHint(true);
    }
  }

  return (
    <div>
      <button
        onClick={handleInstall}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition ${TONES[tone]}`}
      >
        {isIos && !deferred ? <Smartphone className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        {deferred ? "Instalar la app" : isIos ? "Cómo instalarla" : "Instalar la app"}
      </button>
      {showIosHint && (
        <p className="mt-3 text-sm text-choco/70">
          Toca el botón de compartir <span className="font-semibold">⎋</span> y elige{" "}
          <span className="font-semibold">&quot;Añadir a pantalla de inicio&quot;</span>.
        </p>
      )}
    </div>
  );
}
