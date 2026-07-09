import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canAddVehicle } from "@/lib/stripe/license";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { KmUpdateModal } from "@/components/vehicles/KmUpdateModal";
import { buttonVariants } from "@/components/ui/button";

export default async function VehiclesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: vehicles }, allowed] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user!.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    canAddVehicle(user!.id),
  ]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mis Vehículos</h1>
        {allowed && (
          <Link href="/vehicles/new" className={buttonVariants({ size: "sm" })}>
            + Agregar
          </Link>
        )}
      </div>

      {vehicles && vehicles.length > 0 ? (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v.id} className="space-y-2">
              <VehicleCard vehicle={v} />
              <div className="grid grid-cols-2 gap-2">
                <KmUpdateModal vehicleId={v.id} currentKm={v.current_km} />
                <Link
                  href={`/vehicles/${v.id}`}
                  className={buttonVariants({ variant: "ghost", size: "sm" }) + " w-full justify-center"}
                >
                  Ver historial
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Aún no tienes vehículos registrados.
          </p>
          <Link href="/vehicles/new" className={buttonVariants()}>
            Agregar mi primer vehículo
          </Link>
        </div>
      )}

      {vehicles && vehicles.length > 0 && !allowed && (
        <div className="pt-2">
          <Link
            href="/vehicles/new"
            className={buttonVariants({ variant: "outline" }) + " w-full justify-center"}
          >
            + Agregar otro vehículo (requiere licencia)
          </Link>
        </div>
      )}
    </div>
  );
}
