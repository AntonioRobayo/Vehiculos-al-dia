import { createAd } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function NewAdPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ads" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Nuevo anuncio</h1>
      </div>

      <form action={createAd} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="sponsor_name">Nombre del patrocinador *</Label>
          <Input id="sponsor_name" name="sponsor_name" required placeholder="Ej: Taller Rápido" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">URL de imagen</Label>
          <Input id="image_url" name="image_url" type="url" placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link_url">URL de destino</Label>
          <Input id="link_url" name="link_url" type="url" placeholder="https://..." />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="active" defaultChecked className="rounded" />
          <span className="text-sm">Activo (visible en la app)</span>
        </label>
        <Button type="submit" className="w-full">Crear anuncio</Button>
      </form>
    </div>
  );
}
