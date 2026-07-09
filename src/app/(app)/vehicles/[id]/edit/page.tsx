import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { updateVehicle } from "../../actions";
import { buttonVariants } from "@/components/ui/button";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: vehicle }, { data: vehicleTypes }, { data: brands }, { data: references }] =
    await Promise.all([
      supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .single(),
      supabase.from("vehicle_types").select("*").order("name"),
      supabase.from("brands").select("*").order("name"),
      supabase.from("vehicle_references").select("*").order("name"),
    ]);

  if (!vehicle) notFound();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/vehicles" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          ← Volver
        </Link>
        <h1 className="text-xl font-bold">Editar Vehículo</h1>
      </div>

      <VehicleForm
        action={updateVehicle}
        vehicleTypes={vehicleTypes ?? []}
        brands={brands ?? []}
        references={references ?? []}
        defaultValues={vehicle}
      />
    </div>
  );
}
