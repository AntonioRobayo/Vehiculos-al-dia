"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordKm } from "@/app/(app)/vehicles/km-actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Guardando..." : "Registrar km"}
    </Button>
  );
}

export function KmUpdateModal({
  vehicleId,
  currentKm,
}: {
  vehicleId: string;
  currentKm: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(recordKm, null);

  useEffect(() => {
    if (state && "success" in state) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="w-full" />
        }
      >
        Actualizar km
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar kilómetros</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="vehicle_id" value={vehicleId} />

          {state && "error" in state && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="km_value">Kilómetros actuales</Label>
            <Input
              id="km_value"
              name="km_value"
              type="number"
              min={0}
              placeholder={currentKm.toLocaleString("es-CO")}
              required
            />
            <p className="text-xs text-muted-foreground">
              Último registro: {currentKm.toLocaleString("es-CO")} km
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Viaje largo, cambio de aceite..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <SaveButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
