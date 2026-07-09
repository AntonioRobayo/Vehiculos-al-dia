"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type MaintenanceState = { error: string } | null;

export async function createMaintenance(
  _prev: MaintenanceState,
  formData: FormData
): Promise<MaintenanceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const vehicleId = formData.get("vehicle_id") as string;

  const { data: maintenance, error } = await supabase
    .from("maintenances")
    .insert({
      user_id: user.id,
      vehicle_id: vehicleId,
      date: (formData.get("date") as string) || new Date().toISOString().slice(0, 10),
      km_at_service: formData.get("km_at_service") ? Number(formData.get("km_at_service")) : null,
      workshop: (formData.get("workshop") as string) || null,
      notes: (formData.get("notes") as string) || null,
      total_cost: 0,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/maintenance/${vehicleId}`);
  redirect(`/maintenance/${vehicleId}/${maintenance.id}`);
}

export async function updateMaintenance(
  _prev: MaintenanceState,
  formData: FormData
): Promise<MaintenanceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const id = formData.get("id") as string;
  const vehicleId = formData.get("vehicle_id") as string;

  const { error } = await supabase
    .from("maintenances")
    .update({
      date: formData.get("date") as string,
      km_at_service: formData.get("km_at_service") ? Number(formData.get("km_at_service")) : null,
      workshop: (formData.get("workshop") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/maintenance/${vehicleId}/${id}`);
  return null;
}

export async function deleteMaintenance(id: string, vehicleId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("maintenances").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath(`/maintenance/${vehicleId}`);
}

export async function addMaintenanceDetail(
  _prev: MaintenanceState,
  formData: FormData
): Promise<MaintenanceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const maintenanceId = formData.get("maintenance_id") as string;
  const vehicleId = formData.get("vehicle_id") as string;
  const cost = Number(formData.get("cost") ?? 0);

  const { error } = await supabase.from("maintenance_details").insert({
    maintenance_id: maintenanceId,
    action_id: (formData.get("action_id") as string) || null,
    supply_id: (formData.get("supply_id") as string) || null,
    detail: (formData.get("detail") as string) || null,
    cost,
  });

  if (error) return { error: error.message };

  // Recalculate total
  const { data: details } = await supabase
    .from("maintenance_details")
    .select("cost")
    .eq("maintenance_id", maintenanceId);

  const total = (details ?? []).reduce((sum, d) => sum + d.cost, 0);
  await supabase
    .from("maintenances")
    .update({ total_cost: total })
    .eq("id", maintenanceId)
    .eq("user_id", user.id);

  revalidatePath(`/maintenance/${vehicleId}/${maintenanceId}`);
  return null;
}

export async function deleteMaintenanceDetail(
  detailId: string,
  maintenanceId: string,
  vehicleId: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("maintenance_details").delete().eq("id", detailId);

  // Recalculate total
  const { data: details } = await supabase
    .from("maintenance_details")
    .select("cost")
    .eq("maintenance_id", maintenanceId);

  const total = (details ?? []).reduce((sum, d) => sum + d.cost, 0);
  await supabase
    .from("maintenances")
    .update({ total_cost: total })
    .eq("id", maintenanceId)
    .eq("user_id", user.id);

  revalidatePath(`/maintenance/${vehicleId}/${maintenanceId}`);
}
