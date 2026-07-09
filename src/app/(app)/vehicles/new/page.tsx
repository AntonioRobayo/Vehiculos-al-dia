import { createClient } from "@/lib/supabase/server";
import { canAddVehicle } from "@/lib/stripe/license";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { LicenseGate } from "@/components/vehicles/LicenseGate";
import { createVehicle } from "../actions";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function NewVehiclePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [allowed, { data: vehicleTypes }, { data: brands }, { data: references }] =
    await Promise.all([
      canAddVehicle(user!.id),
      supabase.from("vehicle_types").select("*").order("name"),
      supabase.from("brands").select("*").order("name"),
      supabase.from("vehicle_references").select("*").order("name"),
    ]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/vehicles" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          ← Volver
        </Link>
        <h1 className="text-xl font-bold">Agregar Vehículo</h1>
      </div>

      {!allowed ? (
        <LicenseGate />
      ) : (
        <VehicleForm
          action={createVehicle}
          vehicleTypes={vehicleTypes ?? []}
          brands={brands ?? []}
          references={references ?? []}
        />
      )}
    </div>
  );
}
