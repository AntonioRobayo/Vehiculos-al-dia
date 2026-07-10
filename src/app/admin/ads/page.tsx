import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteAd, toggleAd } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminAdsPage() {
  const supabase = await createClient();
  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Anuncios</h1>
        <Link href="/admin/ads/new">
          <Button>+ Nuevo anuncio</Button>
        </Link>
      </div>

      {!ads?.length ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          No hay anuncios todavía. Crea el primero.
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="rounded-xl border bg-card p-4 flex items-center gap-4"
            >
              {ad.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ad.image_url}
                  alt={ad.sponsor_name}
                  className="h-16 w-24 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{ad.sponsor_name}</p>
                {ad.link_url && (
                  <p className="text-xs text-muted-foreground truncate">{ad.link_url}</p>
                )}
              </div>
              <Badge variant={ad.active ? "default" : "secondary"}>
                {ad.active ? "Activo" : "Inactivo"}
              </Badge>
              <div className="flex gap-2 shrink-0">
                <form
                  action={async () => {
                    "use server";
                    await toggleAd(ad.id, !ad.active);
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">
                    {ad.active ? "Desactivar" : "Activar"}
                  </Button>
                </form>
                <Link href={`/admin/ads/${ad.id}/edit`}>
                  <Button variant="outline" size="sm">Editar</Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteAd(ad.id);
                  }}
                >
                  <Button type="submit" variant="destructive" size="sm">
                    Eliminar
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
