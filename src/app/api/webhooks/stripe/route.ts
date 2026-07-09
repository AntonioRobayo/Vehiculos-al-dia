import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      // Retrieve subscription to get item ID
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const item = subscription.items.data[0];

      // Save stripe_customer_id on profile
      if (session.customer) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: session.customer as string })
          .eq("id", userId);
      }

      // Create license slot
      await supabase.from("vehicle_licenses").insert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        stripe_item_id: item?.id ?? null,
        status: "active",
        valid_until: null,
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const status =
        sub.status === "active" || sub.status === "trialing"
          ? sub.status
          : sub.status === "past_due"
          ? "past_due"
          : "canceled";

      await supabase
        .from("vehicle_licenses")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("vehicle_licenses")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
