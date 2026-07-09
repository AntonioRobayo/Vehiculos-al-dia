"use client";

import { useTransition } from "react";
import { deleteMaintenance } from "@/app/(app)/maintenance/actions";
import { useRouter } from "next/navigation";

export function DeleteMaintenanceButton({
  maintenanceId,
  vehicleId,
}: {
  maintenanceId: string;
  vehicleId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (!confirm("¿Eliminar este mantenimiento?")) return;
        startTransition(async () => {
          await deleteMaintenance(maintenanceId, vehicleId);
          router.refresh();
        });
      }}
      disabled={pending}
      className="text-xs text-destructive hover:underline disabled:opacity-50"
    >
      {pending ? "..." : "Eliminar"}
    </button>
  );
}
