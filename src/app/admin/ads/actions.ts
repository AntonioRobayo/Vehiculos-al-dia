"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Sin permisos");
  return supabase;
}

export async function createAd(formData: FormData) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("ads").insert({
    sponsor_name: formData.get("sponsor_name") as string,
    image_url: (formData.get("image_url") as string) || null,
    link_url: (formData.get("link_url") as string) || null,
    active: formData.get("active") === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function updateAd(id: string, formData: FormData) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("ads").update({
    sponsor_name: formData.get("sponsor_name") as string,
    image_url: (formData.get("image_url") as string) || null,
    link_url: (formData.get("link_url") as string) || null,
    active: formData.get("active") === "on",
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function deleteAd(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("ads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ads");
}

export async function toggleAd(id: string, active: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("ads").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ads");
}
