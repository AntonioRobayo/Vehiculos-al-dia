import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteMaintenanceButton } from "@/components/maintenance/DeleteMaintenanceButton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function VehicleMaintenancePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: vehicle }, { data: maintenances }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, name, plate")
      .eq("id", vehicleId)
      .eq("user_id", user!.id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("maintenances")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .eq("user_id", user!.id)
      .order("date", { ascending: false }),
  ]);

  if (!vehicle) notFound();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/maintenance"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Volver
        </Link>
        <div>
          <h1 className="text-xl font-bold">{vehicle.name}</h1>
          {vehicle.plate && (
            <p className="text-xs text-muted-foreground uppercase">{vehicle.plate}</p>
          )}
        </div>
      </div>

      <Link
        href={`/maintenance/${vehicleId}/new`}
        className={buttonVariants() + " w-full justify-center"}
      >
        + Nuevo mantenimiento
      </Link>

      {maintenances && maintenances.length > 0 ? (
        <div className="space-y-3">
          {maintenances.map((m) => (
            <div key={m.id} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{formatDate(m.date)}</p>
                  {m.workshop && (
                    <p className="text-xs text-muted-foreground">{m.workshop}</p>
                  )}
                </div>
                <Badge variant="secondary">{formatCurrency(m.total_cost)}</Badge>
              </div>
              {m.km_at_service && (
                <p className="text-xs text-muted-foreground">
                  {m.km_at_service.toLocaleString("es-CO")} km
                </p>
              )}
              {m.notes && (
                <p className="text-sm text-muted-foreground">{m.notes}</p>
              )}
              <div className="flex gap-3 pt-1">
                <Link
                  href={`/maintenance/${vehicleId}/${m.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver detalles
                </Link>
                <DeleteMaintenanceButton maintenanceId={m.id} vehicleId={vehicleId} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8 rounded-xl border border-dashed">
          Sin registros de mantenimiento. Crea el primero.
        </p>
      )}
    </div>
  );
}
