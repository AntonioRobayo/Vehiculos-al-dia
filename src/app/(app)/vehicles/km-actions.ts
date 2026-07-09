"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type KmState = { error: string } | { success: true } | null;

export async function recordKm(
  _prev: KmState,
  formData: FormData
): Promise<KmState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const vehicleId = formData.get("vehicle_id") as string;
  const kmValue = Number(formData.get("km_value"));
  const notes = (formData.get("notes") as string) || null;

  if (!kmValue || kmValue < 0) return { error: "Ingresa un valor de km válido" };

  // Verify the vehicle belongs to the user
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("current_km")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (!vehicle) return { error: "Vehículo no encontrado" };

  // Insert km_update record
  const { error: insertError } = await supabase.from("km_updates").insert({
    user_id: user.id,
    vehicle_id: vehicleId,
    km_value: kmValue,
    notes,
  });

  if (insertError) return { error: insertError.message };

  // Update vehicle's current_km if the new value is higher
  if (kmValue > vehicle.current_km) {
    await supabase
      .from("vehicles")
      .update({ current_km: kmValue })
      .eq("id", vehicleId)
      .eq("user_id", user.id);
  }

  revalidatePath("/vehicles");
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
