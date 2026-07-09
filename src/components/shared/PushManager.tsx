"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type PushState = "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading";

export function PushManager() {
  const [state, setState] = useState<PushState>("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (Notification.permission === "denied") {
          setState("denied");
        } else if (sub) {
          setState("subscribed");
        } else {
          setState("unsubscribed");
        }
      })
      .catch(() => setState("unsupported"));
  }, []);

  async function subscribe() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      });

      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: json.keys,
        }),
      });

      setState("subscribed");
    } catch {
      setState(Notification.permission === "denied" ? "denied" : "unsubscribed");
    }
  }

  async function unsubscribe() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("unsubscribed");
    } catch {
      setState("unsubscribed");
    }
  }

  if (state === "unsupported") return null;

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-sm">Notificaciones push</h2>
      {state === "denied" && (
        <p className="text-xs text-muted-foreground">
          Las notificaciones están bloqueadas en tu navegador. Habilítalas desde
          la configuración del sitio.
        </p>
      )}
      {state === "subscribed" && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Notificaciones activadas ✓</p>
          <Button variant="outline" size="sm" onClick={unsubscribe}>
            Desactivar
          </Button>
        </div>
      )}
      {state === "unsubscribed" && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Recibe alertas de vencimientos de SOAT y revisión.
          </p>
          <Button size="sm" onClick={subscribe}>
            Activar
          </Button>
        </div>
      )}
      {state === "loading" && (
        <p className="text-xs text-muted-foreground">Cargando...</p>
      )}
    </div>
  );
}
