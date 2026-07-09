import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Vehículo al Día",
  description: "Gestiona el historial de mantenimiento de tus vehículos",
  applicationName: "Vehículo al Día",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vehículo al Día",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
