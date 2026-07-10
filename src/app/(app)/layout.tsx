import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/vehicles", label: "Vehículos" },
  { href: "/maintenance", label: "Mantenimiento" },
  { href: "/reports", label: "Reportes" },
  { href: "/profile", label: "Perfil" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-16">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-slate-500 hover:text-primary transition-colors"
          >
            {label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Admin
          </Link>
        )}
      </nav>
    </div>
  );
}
