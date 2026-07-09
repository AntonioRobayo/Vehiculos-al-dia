import { createClient } from "@/lib/supabase/server";
import { stripe } from "./client";

/**
 * Returns true if the user can add another vehicle.
 * Rule: 1 free vehicle + 1 slot per active license.
 */
export async function canAddVehicle(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const [{ count: vehicleCount }, { count: licenseCount }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("vehicle_licenses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  const totalSlots = 1 + (licenseCount ?? 0);
  return (vehicleCount ?? 0) < totalSlots;
}

/**
 * Creates a Stripe Checkout session for purchasing one additional vehicle license.
 * Redirects to /vehicles/new on success.
 */
export async function createLicenseCheckout(
  userId: string,
  userEmail: string,
  stripeCustomerId: string | null
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId ?? undefined,
    customer_email: stripeCustomerId ? undefined : userEmail,
    line_items: [
      {
        price: process.env.STRIPE_VEHICLE_LICENSE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/vehicles/new?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/vehicles`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });

  return session.url!;
}
