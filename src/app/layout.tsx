import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lici S.A. — Inteligencia de Contratación Pública (PA · CO · CR)",
  description:
    "Infraestructura de monitoreo en tiempo real, auditoría técnica de pliegos y matrices de cumplimiento para PanamáCompra, SECOP II y SICOP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${fontSans.variable} ${fontMono.variable} dark bg-black`}
    >
      <body className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans antialiased selection:bg-[#EDEDED] selection:text-[#000000]">
        {children}
      </body>
    </html>
  );
}
