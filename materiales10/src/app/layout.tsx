import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://constructnoa.vercel.app"),
  title: {
    default: "ConstructNOA - Compará precios de materiales de construcción",
    template: "%s | ConstructNOA",
  },
  description:
    "Encontrá los mejores precios en materiales de construcción. Compará corralones y ferreterías de Salta y Jujuy en un solo lugar.",
  keywords: [
    "materiales de construcción",
    "cemento",
    "hierro",
    "ladrillos",
    "corralones",
    "ferreterías",
    "Salta",
    "Jujuy",
    "precios",
    "comparador",
    "NOA",
  ],
  authors: [{ name: "ConstructNOA" }],
  creator: "ConstructNOA",
  publisher: "ConstructNOA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ConstructNOA",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://constructnoa.vercel.app",
    title: "ConstructNOA - Compará precios de materiales de construcción",
    description:
      "Encontrá los mejores precios en materiales de construcción. Compará corralones y ferreterías de Salta y Jujuy.",
    siteName: "ConstructNOA",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "ConstructNOA - Comparador de precios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConstructNOA - Compará precios de materiales de construcción",
    description:
      "Encontrá los mejores precios en materiales de construcción de Salta y Jujuy.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-black">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="min-h-screen flex flex-col bg-black text-white">
        {/* Header oscuro */}
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <Image src="/images/logotipo.png" alt="ConstructNOA" width={180} height={40} className="h-10 w-auto" priority />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/vendor"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                Soy corralon
              </Link>
              <Link
                href="/search"
                className="btn-primary !py-2 !px-3 sm:!px-4 text-xs sm:text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Buscar materiales</span>
                <span className="sm:hidden">Buscar</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>

        <footer className="border-t border-gray-800 bg-black">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/" className="flex items-center">
                <Image src="/images/logotipo.png" alt="ConstructNOA" width={140} height={32} className="h-8 w-auto" />
              </Link>
              <p className="text-sm text-gray-400">
                Hecho para ahorrar tiempo en obra.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/vendor" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Vendedores
                </Link>
                <Link href="/search" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Buscar
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
