import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LICITA.LAT // Plataforma de Inteligencia y Documentación de Compras Públicas (PA • CO • CR)",
  description:
    "Licitaciones del Estado analizadas, auditadas y ganadas con IA para Panamá (DGCP), Colombia (SECOP II) y Costa Rica (SICOP).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=Geist:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-black text-[#eaeaea] font-sans selection:bg-[#0070f3] selection:text-white pb-24">
        {children}
      </body>
    </html>
  );
}
