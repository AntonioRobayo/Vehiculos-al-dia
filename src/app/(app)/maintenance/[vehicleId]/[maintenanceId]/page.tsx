import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceForm } from "@/components/maintenance/MaintenanceForm";
import { AddDetailForm } from "@/components/maintenance/AddDetailForm";
import { DetailRow } from "@/components/maintenance/DetailRow";
import { updateMaintenance } from "../../actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string; maintenanceId: string }>;
}) {
  const { vehicleId, maintenanceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: maintenance }, { data: details }, { data: actions }, { data: supplies }] =
    await Promise.all([
      supabase
        .from("maintenances")
        .select("*")
        .eq("id", maintenanceId)
        .eq("user_id", user!.id)
        .single(),
      supabase
        .from("maintenance_details")
        .select("*")
        .eq("maintenance_id", maintenanceId)
        .order("created_at"),
      supabase.from("maintenance_actions").select("id, name").order("name"),
      supabase.from("supplies").select("id, name, unit").order("name"),
    ]);

  if (!maintenance) notFound();

  // Build lookup maps for display
  const actionsMap = Object.fromEntries((actions ?? []).map((a) => [a.id, a.name]));
  const suppliesMap = Object.fromEntries((supplies ?? []).map((s) => [s.id, s.name]));

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/maintenance/${vehicleId}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Volver
        </Link>
        <h1 className="text-xl font-bold">Detalle</h1>
      </div>

      {/* Edit maintenance header */}
      <MaintenanceForm
        action={updateMaintenance}
        vehicleId={vehicleId}
        defaultKm={maintenance.km_at_service ?? 0}
        defaultValues={maintenance}
      />

      <Separator />

      {/* Detail rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Items del mantenimiento</h2>
          <Badge variant="secondary">{formatCurrency(maintenance.total_cost)}</Badge>
        </div>

        {details && details.length > 0 ? (
          <div className="space-y-2">
            {details.map((d) => (
              <DetailRow
                key={d.id}
                detail={{
                  id: d.id,
                  detail: d.detail,
                  cost: Number(d.cost),
                  actionName: d.action_id ? (actionsMap[d.action_id] ?? null) : null,
                  supplyName: d.supply_id ? (suppliesMap[d.supply_id] ?? null) : null,
                }}
                maintenanceId={maintenanceId}
                vehicleId={vehicleId}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 rounded-xl border border-dashed">
            Sin items aún. Agrega el primero abajo.
          </p>
        )}
      </div>

      <Separator />

      {/* Add detail form */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm">Agregar item</h2>
        <AddDetailForm
          maintenanceId={maintenanceId}
          vehicleId={vehicleId}
          actions={actions ?? []}
          supplies={supplies ?? []}
        />
      </div>
    </div>
  );
}
