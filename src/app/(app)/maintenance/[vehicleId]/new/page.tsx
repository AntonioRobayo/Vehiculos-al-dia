import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceForm } from "@/components/maintenance/MaintenanceForm";
import { createMaintenance } from "../../actions";
import { buttonVariants } from "@/components/ui/button";

export default async function NewMaintenancePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, name, current_km")
    .eq("id", vehicleId)
    .eq("user_id", user!.id)
    .single();

  if (!vehicle) notFound();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/maintenance/${vehicleId}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Volver
        </Link>
        <h1 className="text-xl font-bold">Nuevo mantenimiento</h1>
      </div>

      <MaintenanceForm
        action={createMaintenance}
        vehicleId={vehicleId}
        defaultKm={vehicle.current_km}
      />
    </div>
  );
}
