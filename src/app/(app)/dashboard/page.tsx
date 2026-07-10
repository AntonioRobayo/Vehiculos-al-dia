import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdsWidget } from "@/components/shared/AdsWidget";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: vehicles }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
    supabase
      .from("vehicles")
      .select("id, name, plate, current_km, soat_expiry, inspection_expiry")
      .eq("user_id", user!.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Usuario";

  const alertCount = (vehicles ?? []).filter((v) => {
    const s = daysUntil(v.soat_expiry);
    const i = daysUntil(v.inspection_expiry);
    return (s !== null && s <= 30) || (i !== null && i <= 30);
  }).length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <div>
          <p className="text-sm text-muted-foreground">Bienvenido</p>
          <h1 className="text-xl font-bold">{firstName}</h1>
        </div>
        <button className="relative p-2 rounded-full hover:bg-accent">
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>
      </header>

      {/* Vehicle cards */}
      <section className="px-4 mb-6">
        {vehicles && vehicles.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {vehicles.map((v) => {
              const soat = daysUntil(v.soat_expiry);
              const inspection = daysUntil(v.inspection_expiry);
              const hasAlert =
                (soat !== null && soat <= 30) ||
                (inspection !== null && inspection <= 30);
              return (
                <Link
                  key={v.id}
                  href={`/vehicles/${v.id}/edit`}
                  className="snap-start shrink-0 w-64 rounded-xl bg-blue-600 text-white p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      {v.plate && (
                        <p className="text-xs text-blue-200 uppercase">{v.plate}</p>
                      )}
                    </div>
                    {hasAlert && (
                      <Badge variant="destructive" className="text-[10px]">
                        Alerta
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">
                    {v.current_km.toLocaleString("es-CO")} km
                  </p>
                </Link>
              );
            })}
            <Link
              href="/vehicles/new"
              className="snap-start shrink-0 w-40 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              + Agregar
            </Link>
          </div>
        ) : (
          <Link
            href="/vehicles/new"
            className="rounded-xl bg-muted h-36 flex items-center justify-center text-sm text-muted-foreground hover:bg-accent transition-colors block"
          >
            + Agrega tu primer vehículo
          </Link>
        )}
      </section>

      {/* Quick actions */}
      <section className="px-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Registrar mantenimiento", href: "/maintenance" },
            { label: "Agregar vehículo", href: "/vehicles/new" },
            { label: "Ver reportes", href: "/reports" },
            { label: "Mi perfil", href: "/profile" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border bg-card p-4 text-sm font-medium hover:bg-accent transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsored ad */}
      <section className="px-4 mt-6">
        <AdsWidget />
      </section>
    </div>
  );
}
