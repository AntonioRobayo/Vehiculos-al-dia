import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/vehicles", label: "Vehículos" },
  { href: "/maintenance", label: "Mantenimiento" },
  { href: "/reports", label: "Reportes" },
  { href: "/profile", label: "Perfil" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-16">{children}</main>

      {/* Bottom navigation bar — mobile first */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-slate-500 hover:text-blue-600 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
