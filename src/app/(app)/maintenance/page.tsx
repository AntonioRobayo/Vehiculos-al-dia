import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

export default async function MaintenancePage() {
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

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Mantenimiento</h1>

      {vehicles && vehicles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Selecciona un vehículo para ver o registrar mantenimientos:
          </p>
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/maintenance/${v.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-4 hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium">{v.name}</p>
                {v.plate && (
                  <p className="text-xs text-muted-foreground uppercase">{v.plate}</p>
                )}
              </div>
              <span className="text-muted-foreground text-sm">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Agrega un vehículo primero para registrar mantenimientos.
          </p>
          <Link href="/vehicles/new" className={buttonVariants()}>
            Agregar vehículo
          </Link>
        </div>
      )}
    </div>
  );
}
