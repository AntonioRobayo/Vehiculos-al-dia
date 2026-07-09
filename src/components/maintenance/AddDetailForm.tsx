"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMaintenanceDetail } from "@/app/(app)/maintenance/actions";
import type { MaintenanceState } from "@/app/(app)/maintenance/actions";

interface Props {
  maintenanceId: string;
  vehicleId: string;
  actions: { id: string; name: string }[];
  supplies: { id: string; name: string; unit: string | null }[];
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Agregando..." : "+ Agregar item"}
    </Button>
  );
}

export function AddDetailForm({ maintenanceId, vehicleId, actions, supplies }: Props) {
  const [state, formAction] = useActionState(addMaintenanceDetail, null);
  const actionRef = useRef<HTMLInputElement>(null);
  const supplyRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="maintenance_id" value={maintenanceId} />
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="action_id" ref={actionRef} defaultValue="" />
      <input type="hidden" name="supply_id" ref={supplyRef} defaultValue="" />

      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label>Acción</Label>
        <Select
          onValueChange={(v: string | null) => {
            if (actionRef.current) actionRef.current.value = v ?? "";
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una acción" />
          </SelectTrigger>
          <SelectContent>
            {actions.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Insumo / Repuesto</Label>
        <Select
          onValueChange={(v: string | null) => {
            if (supplyRef.current) supplyRef.current.value = v ?? "";
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un insumo (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {supplies.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}{s.unit ? ` (${s.unit})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="detail">Descripción</Label>
        <Input
          id="detail"
          name="detail"
          placeholder="Detalles adicionales..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost">Costo (COP)</Label>
        <Input
          id="cost"
          name="cost"
          type="number"
          min={0}
          placeholder="0"
          defaultValue={0}
        />
      </div>

      <AddButton />
    </form>
  );
}
