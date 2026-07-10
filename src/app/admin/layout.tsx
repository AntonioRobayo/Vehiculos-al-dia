import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-primary">VAD Admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/ads" className="text-muted-foreground hover:text-foreground transition-colors">
              Anuncios
            </Link>
          </nav>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Volver a la app
        </Link>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
