"use client";

import { useTransition } from "react";
import { deleteVehicle } from "@/app/(app)/vehicles/actions";

export function DeleteVehicleButton({ vehicleId }: { vehicleId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("¿Desactivar este vehículo?")) return;
        startTransition(() => deleteVehicle(vehicleId));
      }}
      disabled={pending}
      className="text-xs text-destructive hover:underline disabled:opacity-50"
    >
      {pending ? "..." : "Eliminar"}
    </button>
  );
}
