import { CategoryChips } from "@/components";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section - Minimalista como la imagen de referencia */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Materiales de<br />construcción.
          <span className="text-amber-400 block mt-2">Encontrados.</span>
        </h1>
        <p className="text-gray-400 mt-6 text-lg max-w-md mx-auto">
          Corralones y ferreterías de tu zona, en un solo lugar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link href="/search" className="btn-primary text-base px-8 py-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar materiales
          </Link>
          <Link href="/vendor" className="btn-outline text-base px-8 py-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Soy corralón y quiero vender
          </Link>
        </div>
      </section>

      {/* Buscador rápido */}
      <section>
        <Link href="/search" className="block">
          <div className="card p-5 flex items-center gap-4 hover:border-amber-400/50 transition-all cursor-pointer group">
            <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-all">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">¿Qué necesitás?</p>
              <span className="text-gray-500 text-sm">Cemento, hierro, ladrillos, pinturas...</span>
            </div>
            <svg className="w-6 h-6 text-gray-600 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </section>

      {/* Categorías */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-amber-400 rounded-full"></div>
            <h2 className="font-semibold text-white text-lg">Categorías</h2>
          </div>
          <Link href="/search" className="text-sm text-amber-400 font-medium hover:text-amber-300 flex items-center gap-1 transition-colors">
            Ver todo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <CategoryChips />
      </section>

      {/* Beneficios - con iconos más profesionales */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">Compará precios</h3>
            <p className="text-gray-400 mt-1">Encontrá las mejores ofertas de distintos vendedores en tu zona.</p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">Cerca tuyo</h3>
            <p className="text-gray-400 mt-1">Corralones y ferreterías ordenados por distancia a tu ubicación.</p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">Contacto directo</h3>
            <p className="text-gray-400 mt-1">Llamá o escribí por WhatsApp directo al vendedor.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="card p-8">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-amber-400">100+</p>
            <p className="text-gray-500 text-sm mt-1">Vendedores</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-400">500+</p>
            <p className="text-gray-500 text-sm mt-1">Productos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-400">10+</p>
            <p className="text-gray-500 text-sm mt-1">Ciudades</p>
          </div>
        </div>
      </section>

      {/* CTA Final para vendedores */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
        <div className="p-8 md:p-12">
          <div className="max-w-xl">
            <p className="text-amber-400 font-medium text-sm uppercase tracking-wider mb-3">Para corralones y ferreterías</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Publicá tus materiales y llegá a más clientes
            </h3>
            <p className="text-gray-400 mb-8">
              Registrate gratis, subí tu catálogo y empezá a recibir consultas de compradores en tu zona.
            </p>
            <Link href="/vendor" className="btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Empezar a vender
            </Link>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
}
