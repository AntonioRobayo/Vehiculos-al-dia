"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startLicenseCheckout } from "@/app/(app)/vehicles/actions";

export function LicenseGate() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50 p-6 text-center space-y-3">
      <p className="text-sm font-semibold text-blue-800">
        Ya usaste tu vehículo gratuito
      </p>
      <p className="text-xs text-blue-700">
        Cada vehículo adicional requiere una licencia mensual.
      </p>
      <Button
        onClick={() =>
          startTransition(() => startLicenseCheckout())
        }
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {pending ? "Redirigiendo..." : "Obtener licencia — $X/mes"}
      </Button>
    </div>
  );
}
