"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <Button variant="destructive" className="w-full" disabled={pending}>
      {pending ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <Inner />
    </form>
  );
}
