"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  vehicles: { id: string; name: string; plate: string | null }[];
  selectedId: string;
}

export function VehicleSelector({ vehicles, selectedId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      value={selectedId}
      onValueChange={(v: string | null) => {
        if (!v) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("vehicle", v);
        router.push(`/reports?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecciona un vehículo" />
      </SelectTrigger>
      <SelectContent>
        {vehicles.map((v) => (
          <SelectItem key={v.id} value={v.id}>
            {v.name}{v.plate ? ` — ${v.plate.toUpperCase()}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
