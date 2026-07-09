"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando..." : "Guardar cambios"}
    </Button>
  );
}

export function ProfileEditor({ fullName }: { fullName: string | null }) {
  const [state, formAction] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="space-y-4">
      {state === null && (
        /* null after a successful save — show nothing */
        <></>
      )}
      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={fullName ?? ""}
          placeholder="Tu nombre"
          required
        />
      </div>

      <SaveButton />
    </form>
  );
}
