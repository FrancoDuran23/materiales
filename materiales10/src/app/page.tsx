import { CategoryChips } from "@/components";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Geometric background */}
        <div className="hero-geo" />
        <div className="geo-diamond top-20 right-[10%] hidden sm:block" />
        <div className="geo-diamond bottom-32 left-[5%] w-16 h-16 hidden sm:block" />

        {/* Large faded background text */}
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] sm:text-[20rem] lg:text-[28rem] font-black text-white/[0.03] select-none pointer-events-none leading-none"
          aria-hidden="true"
        >
          NOA
        </span>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-20">
          <p className="section-title mb-6">
            Compará precios de corralones en Jujuy y Salta
          </p>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
            Encontrá el
            <br />
            <span className="text-amber-400">mejor precio</span>
            <br />
            para tu obra
          </h1>

          <p className="text-gray-400 mt-6 text-lg sm:text-xl max-w-xl mx-auto">
            Buscá cualquier material, compará precios entre corralones de tu
            zona y contactá directo por WhatsApp. Gratis, sin registro.
          </p>

          {/* Search bar */}
          <Link href="/search" className="block mt-10 max-w-2xl mx-auto">
            <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-3 flex items-center gap-3 hover:border-amber-400/40 transition-all cursor-pointer group">
              <div className="flex-1 flex items-center gap-3 px-3">
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-gray-500 text-sm sm:text-base">
                  Cemento, hierro, ladrillos, pinturas...
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-gray-400 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Ubicación
                </div>
              </div>

              <div className="bg-amber-400 text-black px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap">
                Buscar
              </div>
            </div>
          </Link>

          {/* Stats banner */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm text-gray-500">
            <span><span className="text-amber-400 font-semibold">+1.800</span> precios</span>
            <span className="hidden sm:inline text-gray-700">·</span>
            <span><span className="text-amber-400 font-semibold">7</span> categorías</span>
            <span className="hidden sm:inline text-gray-700">·</span>
            <span>Corralones de <span className="text-amber-400 font-semibold">Jujuy y Salta</span></span>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
            <span className="text-xs uppercase tracking-widest">Explorar</span>
            <svg
              className="w-5 h-5 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section className="bg-[#0D1117] py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white whitespace-nowrap">
              ¿Qué necesitás para tu obra?
            </h2>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <CategoryChips />
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Benefit 1 */}
          <div className="benefit-card bg-[#0D1117] rounded-2xl p-6 sm:p-8 flex items-start gap-6">
            <span className="text-5xl sm:text-7xl font-black text-amber-400/20 leading-none select-none">
              01
            </span>
            <div className="pt-1 sm:pt-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Dejá de recorrer corralones
              </h3>
              <p className="text-gray-400 mt-2 max-w-lg">
                ¿Cuántas horas perdés yendo de corralón en corralón preguntando
                precios? Acá los ves todos juntos, al instante.
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="benefit-card benefit-card-right bg-[#0D1117] rounded-2xl p-6 sm:p-8 flex flex-row-reverse items-start gap-6 text-right">
            <span className="text-5xl sm:text-7xl font-black text-amber-400/20 leading-none select-none">
              02
            </span>
            <div className="pt-1 sm:pt-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Encontrá el más cercano a tu obra
              </h3>
              <p className="text-gray-400 mt-2 max-w-lg ml-auto">
                Activá tu ubicación y sabé qué corralón te queda más cerca.
                Ahorrá en flete y tiempo.
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="benefit-card bg-[#0D1117] rounded-2xl p-6 sm:p-8 flex items-start gap-6">
            <span className="text-5xl sm:text-7xl font-black text-amber-400/20 leading-none select-none">
              03
            </span>
            <div className="pt-1 sm:pt-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Hablale directo al corralón
              </h3>
              <p className="text-gray-400 mt-2 max-w-lg">
                Sin crear cuenta, sin intermediarios. Tocás un botón y ya estás
                hablando por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner for Vendors ── */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="gradient-border rounded-2xl p-8 sm:p-12">
            <span className="inline-block bg-amber-400/10 text-amber-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-amber-400/20 mb-6">
              Para corralones
            </span>

            <h3 className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Tus clientes ya están buscando.
              <br />
              ¿Van a encontrar tus precios?
            </h3>

            <p className="text-gray-400 max-w-lg mb-8">
              Más de 1.800 productos se comparan en la plataforma. Registrate
              gratis, sin comisiones, y empezá a recibir consultas por WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/vendor" className="btn-primary text-base px-8 py-4">
                Empezar ahora
              </Link>
              <Link href="/search" className="btn-outline text-base px-8 py-4">
                Ver cómo funciona
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
