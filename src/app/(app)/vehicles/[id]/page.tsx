import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KmUpdateModal } from "@/components/vehicles/KmUpdateModal";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: vehicle }, { data: kmHistory }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("km_updates")
      .select("*")
      .eq("vehicle_id", id)
      .eq("user_id", user!.id)
      .order("recorded_at", { ascending: false })
      .limit(50),
  ]);

  if (!vehicle) notFound();

  return (
    <div className="p-4 space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link
          href="/vehicles"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Volver
        </Link>
        <div>
          <h1 className="text-xl font-bold">{vehicle.name}</h1>
          {vehicle.plate && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {vehicle.plate}
            </p>
          )}
        </div>
      </div>

      {/* Current km + update button */}
      <div className="rounded-xl bg-blue-600 text-white p-4 space-y-3">
        <div>
          <p className="text-xs text-blue-200">Kilómetros actuales</p>
          <p className="text-3xl font-bold">
            {vehicle.current_km.toLocaleString("es-CO")}
            <span className="text-lg font-normal text-blue-200 ml-1">km</span>
          </p>
        </div>
        <KmUpdateModal vehicleId={vehicle.id} currentKm={vehicle.current_km} />
      </div>

      {/* Edit link */}
      <Link
        href={`/vehicles/${vehicle.id}/edit`}
        className={buttonVariants({ variant: "outline" }) + " w-full justify-center"}
      >
        Editar información del vehículo
      </Link>

      {/* Km history */}
      <div className="space-y-3">
        <h2 className="font-semibold">Historial de km</h2>

        {kmHistory && kmHistory.length > 0 ? (
          <ol className="relative border-l border-border ml-3 space-y-4">
            {kmHistory.map((entry) => (
              <li key={entry.id} className="ml-4">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border bg-background" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {entry.km_value.toLocaleString("es-CO")} km
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.recorded_at)}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6 rounded-xl border border-dashed">
            Aún no hay registros de km. Usa el botón de arriba para agregar el primero.
          </p>
        )}
      </div>
    </div>
  );
}
