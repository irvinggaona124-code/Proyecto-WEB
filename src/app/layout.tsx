import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auralis - Bringing technology to life | AI Voice Infrastructure",
  description:
    "Making digital experiences sound human. Enterprise AI audio infrastructure engineered for precision, ultra-low latency, and omnichannel agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}
