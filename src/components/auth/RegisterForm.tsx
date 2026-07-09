"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { register } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, null);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">Empieza a gestionar tus vehículos</p>
      </div>

      <form action={formAction} className="space-y-4">
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
            autoComplete="name"
            placeholder="Tu nombre"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
          />
        </div>

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
