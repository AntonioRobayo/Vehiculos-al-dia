"use client";

import { useActionState, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/lib/supabase/types";
import type { VehicleState } from "@/app/(app)/vehicles/actions";

type VehicleType = Tables<"vehicle_types">;
type Brand = Tables<"brands">;
type Reference = Tables<"vehicle_references">;

interface VehicleFormProps {
  action: (prev: VehicleState, formData: FormData) => Promise<VehicleState>;
  vehicleTypes: VehicleType[];
  brands: Brand[];
  references: Reference[];
  defaultValues?: Partial<Tables<"vehicles">>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export function VehicleForm({
  action,
  vehicleTypes,
  brands,
  references,
  defaultValues,
}: VehicleFormProps) {
  const [state, formAction] = useActionState(action, null);

  const [selectedTypeId, setSelectedTypeId] = useState<string>(
    defaultValues?.vehicle_type_id ?? ""
  );
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    defaultValues?.brand_id ?? ""
  );

  const typeInputRef = useRef<HTMLInputElement>(null);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const filteredBrands = brands.filter(
    (b) => !selectedTypeId || b.vehicle_type_id === selectedTypeId
  );
  const filteredRefs = references.filter(
    (r) => !selectedBrandId || r.brand_id === selectedBrandId
  );

  const isEdit = !!defaultValues?.id;

  return (
    <form action={formAction} className="space-y-4">
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {/* Hidden inputs carry the selected IDs into FormData */}
      <input type="hidden" name="vehicle_type_id" ref={typeInputRef} defaultValue={defaultValues?.vehicle_type_id ?? ""} />
      <input type="hidden" name="brand_id" ref={brandInputRef} defaultValue={defaultValues?.brand_id ?? ""} />
      <input type="hidden" name="reference_id" ref={refInputRef} defaultValue={defaultValues?.reference_id ?? ""} />

      {state?.error && state.error !== "NEEDS_LICENSE" && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del vehículo *</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Mi moto, Camioneta familiar..."
          defaultValue={defaultValues?.name ?? ""}
        />
      </div>

      {/* Vehicle type */}
      <div className="space-y-2">
        <Label>Tipo de vehículo</Label>
        <Select
          value={selectedTypeId || undefined}
          onValueChange={(v: string | null) => {
            const val = v ?? "";
            setSelectedTypeId(val);
            setSelectedBrandId("");
            if (typeInputRef.current) typeInputRef.current.value = val;
            if (brandInputRef.current) brandInputRef.current.value = "";
            if (refInputRef.current) refInputRef.current.value = "";
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            {vehicleTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.icon ? `${t.icon} ` : ""}{t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label>Marca</Label>
        <Select
          value={selectedBrandId || undefined}
          onValueChange={(v: string | null) => {
            const val = v ?? "";
            setSelectedBrandId(val);
            if (brandInputRef.current) brandInputRef.current.value = val;
            if (refInputRef.current) refInputRef.current.value = "";
          }}
          disabled={filteredBrands.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                filteredBrands.length === 0
                  ? "Selecciona un tipo primero"
                  : "Selecciona una marca"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {filteredBrands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reference */}
      <div className="space-y-2">
        <Label>Referencia / Modelo</Label>
        <Select
          defaultValue={defaultValues?.reference_id ?? undefined}
          onValueChange={(v: string | null) => {
            if (refInputRef.current) refInputRef.current.value = v ?? "";
          }}
          disabled={filteredRefs.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                filteredRefs.length === 0
                  ? "Selecciona una marca primero"
                  : "Selecciona una referencia"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {filteredRefs.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plate + year */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="plate">Placa</Label>
          <Input
            id="plate"
            name="plate"
            placeholder="AAA000"
            defaultValue={defaultValues?.plate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model_year">Año modelo</Label>
          <Input
            id="model_year"
            name="model_year"
            type="number"
            placeholder="2020"
            min={1900}
            max={2100}
            defaultValue={defaultValues?.model_year ?? ""}
          />
        </div>
      </div>

      {/* Current km */}
      <div className="space-y-2">
        <Label htmlFor="current_km">Kilómetros actuales</Label>
        <Input
          id="current_km"
          name="current_km"
          type="number"
          placeholder="0"
          min={0}
          defaultValue={defaultValues?.current_km ?? 0}
        />
      </div>

      {/* SOAT + Inspection expiry */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="soat_expiry">Vencimiento SOAT</Label>
          <Input
            id="soat_expiry"
            name="soat_expiry"
            type="date"
            defaultValue={defaultValues?.soat_expiry ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inspection_expiry">Vencimiento Revisión</Label>
          <Input
            id="inspection_expiry"
            name="inspection_expiry"
            type="date"
            defaultValue={defaultValues?.inspection_expiry ?? ""}
          />
        </div>
      </div>

      {/* Oil reference */}
      <div className="space-y-2">
        <Label htmlFor="oil_reference">Referencia de aceite</Label>
        <Input
          id="oil_reference"
          name="oil_reference"
          placeholder="5W-30, 10W-40..."
          defaultValue={defaultValues?.oil_reference ?? ""}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Notas adicionales</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Color, características especiales..."
          defaultValue={defaultValues?.description ?? ""}
          rows={3}
        />
      </div>

      <SubmitButton label={isEdit ? "Guardar cambios" : "Agregar vehículo"} />
    </form>
  );
}
