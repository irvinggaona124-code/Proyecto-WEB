import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lici SA — Plataforma de Inteligencia de Compras Públicas (PA, CO, CR)",
  description: "Monitoreo en tiempo real, auditoría matemática de pliegos y matrices de cumplimiento en Excel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark bg-black">
      <body className="min-h-screen bg-black text-[#EDEDED] antialiased">
        {children}
      </body>
    </html>
  );
}
