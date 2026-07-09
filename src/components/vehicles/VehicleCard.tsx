import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/supabase/types";
import { DeleteVehicleButton } from "./DeleteVehicleButton";

type Vehicle = Tables<"vehicles">;

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function ExpiryBadge({ label, days }: { label: string; days: number | null }) {
  if (days === null) return null;
  const variant =
    days < 0 ? "destructive" : days <= 30 ? "outline" : "secondary";
  const text =
    days < 0
      ? `${label} vencido`
      : days === 0
      ? `${label} hoy`
      : `${label} en ${days}d`;
  return (
    <Badge variant={variant} className="text-xs">
      {text}
    </Badge>
  );
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const soatDays = daysUntil(vehicle.soat_expiry);
  const inspectionDays = daysUntil(vehicle.inspection_expiry);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{vehicle.name}</h3>
          {vehicle.plate && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {vehicle.plate}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
            className="text-xs text-blue-600 hover:underline"
          >
            Editar
          </Link>
          <DeleteVehicleButton vehicleId={vehicle.id} />
        </div>
      </div>

      {/* Km */}
      <p className="text-sm">
        <span className="font-medium">{vehicle.current_km.toLocaleString("es-CO")}</span>{" "}
        <span className="text-muted-foreground">km</span>
      </p>

      {/* Expiry badges */}
      {(soatDays !== null || inspectionDays !== null) && (
        <div className="flex flex-wrap gap-2">
          <ExpiryBadge label="SOAT" days={soatDays} />
          <ExpiryBadge label="Revisión" days={inspectionDays} />
        </div>
      )}
    </div>
  );
}
