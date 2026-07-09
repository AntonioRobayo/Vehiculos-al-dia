"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MaintenanceState } from "@/app/(app)/maintenance/actions";
import type { Tables } from "@/lib/supabase/types";

interface MaintenanceFormProps {
  action: (prev: MaintenanceState, formData: FormData) => Promise<MaintenanceState>;
  vehicleId: string;
  defaultKm: number;
  defaultValues?: Tables<"maintenances">;
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export function MaintenanceForm({
  action,
  vehicleId,
  defaultKm,
  defaultValues,
}: MaintenanceFormProps) {
  const [state, formAction] = useActionState(action, null);
  const isEdit = !!defaultValues;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      {isEdit && <input type="hidden" name="id" value={defaultValues!.id} />}

      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultValues?.date ?? today}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km_at_service">Km en servicio</Label>
          <Input
            id="km_at_service"
            name="km_at_service"
            type="number"
            min={0}
            placeholder={String(defaultKm)}
            defaultValue={defaultValues?.km_at_service ?? defaultKm}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workshop">Taller / Lugar</Label>
        <Input
          id="workshop"
          name="workshop"
          placeholder="Nombre del taller"
          defaultValue={defaultValues?.workshop ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Observaciones, próxima revisión..."
          defaultValue={defaultValues?.notes ?? ""}
          rows={3}
        />
      </div>

      <SaveButton label={isEdit ? "Guardar cambios" : "Crear mantenimiento"} />
    </form>
  );
}
