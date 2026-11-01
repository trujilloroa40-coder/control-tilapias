import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control Tilapias",
  description: "Gestion de produccion de tilapias para finca",
  applicationName: "Control Tilapias",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Tilapias",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-950 antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
