// Supabase Edge Function — runs daily via cron
// Sends Web Push notifications to users whose vehicles have SOAT or inspection
// expiring within the next 30 days.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// web-push compatible signing via WebCrypto (Deno-native, no npm needed)
async function signVapid(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<string> {
  const header = btoa(JSON.stringify({ typ: "JWT", alg: "ES256" }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(
    JSON.stringify({ aud: audience, exp: now + 12 * 3600, sub: subject })
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const unsignedToken = `${header}.${payload}`;

  // Import private key
  const keyData = Uint8Array.from(
    atob(privateKey.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  );
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${sigBase64}`;
}

async function sendPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url: string },
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await signVapid(audience, vapidSubject, vapidPublicKey, vapidPrivateKey);

  const body = JSON.stringify(payload);
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `vapid t=${jwt},k=${vapidPublicKey}`,
      TTL: "86400",
    },
    body,
  });

  return response.status;
}

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY")!;
  const vapidSubject = Deno.env.get("VAPID_SUBJECT")!;

  const today = new Date();
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const todayStr = today.toISOString().slice(0, 10);
  const in30Str = in30.toISOString().slice(0, 10);

  // Find vehicles expiring soon
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("user_id, name, soat_expiry, inspection_expiry")
    .eq("is_active", true)
    .or(
      `soat_expiry.gte.${todayStr},soat_expiry.lte.${in30Str},inspection_expiry.gte.${todayStr},inspection_expiry.lte.${in30Str}`
    );

  if (!vehicles || vehicles.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  let sent = 0;

  for (const vehicle of vehicles) {
    // Compose message
    const alerts: string[] = [];
    if (vehicle.soat_expiry && vehicle.soat_expiry >= todayStr && vehicle.soat_expiry <= in30Str) {
      const days = Math.ceil(
        (new Date(vehicle.soat_expiry).getTime() - today.getTime()) / 86_400_000
      );
      alerts.push(`SOAT vence en ${days} días`);
    }
    if (
      vehicle.inspection_expiry &&
      vehicle.inspection_expiry >= todayStr &&
      vehicle.inspection_expiry <= in30Str
    ) {
      const days = Math.ceil(
        (new Date(vehicle.inspection_expiry).getTime() - today.getTime()) / 86_400_000
      );
      alerts.push(`Revisión técnica vence en ${days} días`);
    }
    if (alerts.length === 0) continue;

    // Get subscriptions for this user
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", vehicle.user_id);

    if (!subs) continue;

    for (const sub of subs) {
      const status = await sendPush(
        sub,
        {
          title: `⚠️ ${vehicle.name}`,
          body: alerts.join(" · "),
          url: "/vehicles",
        },
        vapidPublic,
        vapidPrivate,
        vapidSubject
      );

      if (status === 410 || status === 404) {
        // Subscription expired — clean it up
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      } else {
        sent++;
      }
    }
  }

  return new Response(JSON.stringify({ sent }), { status: 200 });
});
