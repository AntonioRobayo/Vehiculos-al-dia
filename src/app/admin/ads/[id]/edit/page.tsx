import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateAd } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: ad } = await supabase.from("ads").select("*").eq("id", id).single();
  if (!ad) notFound();

  const action = updateAd.bind(null, id);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ads" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Editar anuncio</h1>
      </div>

      <form action={action} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="sponsor_name">Nombre del patrocinador *</Label>
          <Input id="sponsor_name" name="sponsor_name" required defaultValue={ad.sponsor_name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">URL de imagen</Label>
          <Input id="image_url" name="image_url" type="url" defaultValue={ad.image_url ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link_url">URL de destino</Label>
          <Input id="link_url" name="link_url" type="url" defaultValue={ad.link_url ?? ""} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="active" defaultChecked={ad.active} className="rounded" />
          <span className="text-sm">Activo (visible en la app)</span>
        </label>
        <Button type="submit" className="w-full">Guardar cambios</Button>
      </form>
    </div>
  );
}
