import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { VehicleSelector } from "@/components/reports/VehicleSelector";
import { StatCard } from "@/components/reports/StatCard";
import { Badge } from "@/components/ui/badge";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ExpiryRow({ label, dateStr }: { label: string; dateStr: string | null }) {
  if (!dateStr) return null;
  const days = daysUntil(dateStr);
  if (days === null) return null;
  const variant =
    days < 0 ? "destructive" : days <= 30 ? "outline" : "secondary";
  const text =
    days < 0
      ? `Vencido hace ${Math.abs(days)} días`
      : days === 0
      ? "Vence hoy"
      : `Vence en ${days} días`;

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{formatDate(dateStr)}</span>
        <Badge variant={variant} className="text-xs">{text}</Badge>
      </div>
    </div>
  );
}

interface ReportsPageProps {
  searchParams: Promise<{ vehicle?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { vehicle: vehicleId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, name, plate")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const selectedId = vehicleId ?? vehicles?.[0]?.id ?? null;

  // No vehicles at all
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Reportes</h1>
        <p className="text-sm text-muted-foreground text-center py-12 rounded-xl border border-dashed">
          Agrega un vehículo para ver reportes.
        </p>
      </div>
    );
  }

  // Fetch all data for selected vehicle
  const [
    { data: vehicle },
    { data: kmHistory },
    { data: maintenances },
    { data: detailsCost },
  ] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("id", selectedId!)
      .eq("user_id", user!.id)
      .single(),
    supabase
      .from("km_updates")
      .select("km_value, recorded_at")
      .eq("vehicle_id", selectedId!)
      .eq("user_id", user!.id)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("maintenances")
      .select("id, date, workshop, total_cost, km_at_service")
      .eq("vehicle_id", selectedId!)
      .eq("user_id", user!.id)
      .order("date", { ascending: false })
      .limit(10),
    supabase
      .from("maintenance_details")
      .select("cost, maintenance_id, maintenances!inner(vehicle_id, user_id)")
      .eq("maintenances.vehicle_id", selectedId!)
      .eq("maintenances.user_id", user!.id),
  ]);

  // Stats
  const totalSpend = (maintenances ?? []).reduce(
    (sum, m) => sum + Number(m.total_cost),
    0
  );
  const maintenanceCount = maintenances?.length ?? 0;

  // Km stats from km_updates
  let kmLogged = 0;
  let avgKmPerMonth = 0;
  if (kmHistory && kmHistory.length >= 2) {
    const first = kmHistory[0];
    const last = kmHistory[kmHistory.length - 1];
    kmLogged = last.km_value - first.km_value;
    const months =
      (new Date(last.recorded_at).getTime() - new Date(first.recorded_at).getTime()) /
      (1000 * 60 * 60 * 24 * 30.44);
    avgKmPerMonth = months > 0 ? Math.round(kmLogged / months) : 0;
  }

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-xl font-bold">Reportes</h1>

      {/* Vehicle selector */}
      <Suspense>
        <VehicleSelector
          vehicles={vehicles}
          selectedId={selectedId ?? vehicles[0].id}
        />
      </Suspense>

      {vehicle && (
        <>
          {/* Document expiry alerts */}
          {(vehicle.soat_expiry || vehicle.inspection_expiry) && (
            <div className="rounded-xl border bg-card p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Documentos
              </p>
              <ExpiryRow label="SOAT" dateStr={vehicle.soat_expiry} />
              <ExpiryRow label="Revisión tecnomecánica" dateStr={vehicle.inspection_expiry} />
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Km registrados"
              value={
                kmHistory && kmHistory.length >= 2
                  ? kmLogged.toLocaleString("es-CO")
                  : vehicle.current_km.toLocaleString("es-CO")
              }
              sub={
                kmHistory && kmHistory.length >= 2
                  ? "diferencia registrada"
                  : "km actuales"
              }
            />
            <StatCard
              label="Promedio km/mes"
              value={
                avgKmPerMonth > 0
                  ? avgKmPerMonth.toLocaleString("es-CO")
                  : "—"
              }
              sub={avgKmPerMonth > 0 ? "basado en historial" : "sin historial"}
            />
            <StatCard
              label="Gasto total"
              value={formatCurrency(totalSpend)}
              sub="en mantenimientos"
            />
            <StatCard
              label="Mantenimientos"
              value={String(maintenanceCount)}
              sub="registros"
            />
          </div>

          {/* Recent maintenances */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm">Últimos mantenimientos</h2>
            {maintenances && maintenances.length > 0 ? (
              <div className="space-y-2">
                {maintenances.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border bg-card p-3 flex items-start justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{formatDate(m.date)}</p>
                      {m.workshop && (
                        <p className="text-xs text-muted-foreground">{m.workshop}</p>
                      )}
                      {m.km_at_service && (
                        <p className="text-xs text-muted-foreground">
                          {m.km_at_service.toLocaleString("es-CO")} km
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {formatCurrency(Number(m.total_cost))}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6 rounded-xl border border-dashed">
                Sin mantenimientos registrados aún.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
