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
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image src="/images/logotipo.png" alt="ConstructNOA" width={36} height={36} className="h-8 w-auto sm:h-9" priority />
              <div className="flex items-baseline gap-0">
                <span className="text-lg sm:text-xl font-bold text-white leading-none">Construct</span>
                <span className="text-lg sm:text-xl font-bold text-amber-400 leading-none">NOA</span>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/vendor"
                className="hidden sm:inline-flex text-sm text-gray-400 hover:text-white transition-colors"
              >
                Soy corralón
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Buscar</span>
              </Link>
              {/* Mobile vendor link */}
              <Link
                href="/vendor"
                className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                title="Soy corralón"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>

        <footer className="border-t border-white/[0.06] bg-black">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/images/logotipo.png" alt="ConstructNOA" width={28} height={28} className="h-6 w-auto" />
                <span className="font-bold text-white text-sm">Construct</span>
                <span className="font-bold text-amber-400 text-sm">NOA</span>
              </Link>
              <p className="text-xs text-gray-500">
                Hecho en el NOA, para el NOA.
              </p>
              <div className="flex items-center gap-4 text-xs">
                <Link href="/vendor" className="text-gray-500 hover:text-amber-400 transition-colors">
                  Vendedores
                </Link>
                <Link href="/search" className="text-gray-500 hover:text-amber-400 transition-colors">
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
