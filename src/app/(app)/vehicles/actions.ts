"use server";

import { createClient } from "@/lib/supabase/server";
import { canAddVehicle, createLicenseCheckout } from "@/lib/stripe/license";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type VehicleState = { error: string } | null;

export async function createVehicle(
  _prev: VehicleState,
  formData: FormData
): Promise<VehicleState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const allowed = await canAddVehicle(user.id);
  if (!allowed) return { error: "NEEDS_LICENSE" };

  const { error } = await supabase.from("vehicles").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    vehicle_type_id: (formData.get("vehicle_type_id") as string) || null,
    brand_id: (formData.get("brand_id") as string) || null,
    reference_id: (formData.get("reference_id") as string) || null,
    plate: (formData.get("plate") as string) || null,
    model_year: formData.get("model_year") ? Number(formData.get("model_year")) : null,
    current_km: formData.get("current_km") ? Number(formData.get("current_km")) : 0,
    soat_expiry: (formData.get("soat_expiry") as string) || null,
    inspection_expiry: (formData.get("inspection_expiry") as string) || null,
    oil_reference: (formData.get("oil_reference") as string) || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  redirect("/vehicles");
}

export async function updateVehicle(
  _prev: VehicleState,
  formData: FormData
): Promise<VehicleState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("vehicles")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      vehicle_type_id: (formData.get("vehicle_type_id") as string) || null,
      brand_id: (formData.get("brand_id") as string) || null,
      reference_id: (formData.get("reference_id") as string) || null,
      plate: (formData.get("plate") as string) || null,
      model_year: formData.get("model_year") ? Number(formData.get("model_year")) : null,
      current_km: formData.get("current_km") ? Number(formData.get("current_km")) : undefined,
      soat_expiry: (formData.get("soat_expiry") as string) || null,
      inspection_expiry: (formData.get("inspection_expiry") as string) || null,
      oil_reference: (formData.get("oil_reference") as string) || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  redirect("/vehicles");
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("vehicles")
    .update({ is_active: false })
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
}

export async function startLicenseCheckout(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const url = await createLicenseCheckout(
    user.id,
    user.email!,
    profile?.stripe_customer_id ?? null
  );

  redirect(url);
}
