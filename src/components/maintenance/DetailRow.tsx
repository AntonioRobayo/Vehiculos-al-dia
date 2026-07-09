"use client";

import { useTransition } from "react";
import { deleteMaintenanceDetail } from "@/app/(app)/maintenance/actions";

interface DetailRowProps {
  detail: {
    id: string;
    detail: string | null;
    cost: number;
    actionName: string | null;
    supplyName: string | null;
  };
  maintenanceId: string;
  vehicleId: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function DetailRow({ detail, maintenanceId, vehicleId }: DetailRowProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between rounded-lg border bg-card p-3">
      <div className="space-y-0.5">
        {detail.actionName && (
          <p className="text-sm font-medium">{detail.actionName}</p>
        )}
        {detail.supplyName && (
          <p className="text-xs text-muted-foreground">{detail.supplyName}</p>
        )}
        {detail.detail && (
          <p className="text-xs text-muted-foreground">{detail.detail}</p>
        )}
        {!detail.actionName && !detail.supplyName && !detail.detail && (
          <p className="text-sm text-muted-foreground">Item sin descripción</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-sm font-medium">{formatCurrency(detail.cost)}</span>
        <button
          onClick={() => {
            if (!confirm("¿Eliminar este item?")) return;
            startTransition(() =>
              deleteMaintenanceDetail(detail.id, maintenanceId, vehicleId)
            );
          }}
          disabled={pending}
          className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
          {pending ? "..." : "×"}
        </button>
      </div>
    </div>
  );
}
