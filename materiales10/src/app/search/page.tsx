"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner, OfferCard, LocationPicker, CategoryIcon } from "@/components";
import { searchOffers, CATEGORIES } from "@/lib";
import { STOCK_LABELS } from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import type { SearchOfferResult, BuyerLocation } from "@/lib/database.types";
import Link from "next/link";
import Image from "next/image";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") ?? "";
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sortMode, setSortMode] = useState<"price" | "distance">("price");
  const [location, setLocation] = useState<BuyerLocation | null>(null);
  const [results, setResults] = useState<SearchOfferResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Use refs to always have current values in callbacks
  const locationRef = useRef(location);
  const categoryRef = useRef(category);
  const sortModeRef = useRef(sortMode);
  const queryRef = useRef(query);

  locationRef.current = location;
  categoryRef.current = category;
  sortModeRef.current = sortMode;
  queryRef.current = query;

  const doSearch = useCallback(async (q?: string) => {
    const searchQuery = q ?? queryRef.current;
    setLoading(true);
    setSearched(true);

    const loc = locationRef.current;
    const data = await searchOffers({
      q: searchQuery,
      buyerLat: loc?.lat,
      buyerLng: loc?.lng,
      categorySlug: categoryRef.current || null,
      sortMode: sortModeRef.current,
    });

    setResults(data);
    setLoading(false);
  }, []);

  // Initial search only after location has had a chance to load
  const initialSearchDone = useRef(false);
  useEffect(() => {
    if (initialSearchDone.current) return;
    if (initialQuery || initialCategory) {
      // Small delay to let LocationPicker load saved location
      const timeout = setTimeout(() => {
        initialSearchDone.current = true;
        doSearch(initialQuery);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [initialQuery, initialCategory, doSearch]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    router.replace(`/search?${params.toString()}`);
    initialSearchDone.current = true;
    doSearch(query);
  }

  // Re-search when location changes
  useEffect(() => {
    if (searched) doSearch();
  }, [location]);

  function handleSortChange(mode: "price" | "distance") {
    setSortMode(mode);
    sortModeRef.current = mode;
    if (searched) doSearch();
  }

  function handleCategoryChange(slug: string) {
    setCategory(slug);
    categoryRef.current = slug;
    if (searched) doSearch();
  }

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "disponible": return "badge badge-success";
      case "consultar": return "badge badge-warning";
      case "sin_stock": return "badge badge-error";
      default: return "badge badge-neutral";
    }
  };

  const activeCategoryName = CATEGORIES.find((c) => c.slug === category)?.name;

  function clearFilters() {
    setCategory("");
    categoryRef.current = "";
    setLocation(null);
    locationRef.current = null;
    if (searched) doSearch();
  }

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
        <h2 className="text-lg font-bold text-white">Filtros</h2>

        {/* Categorias */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Categorías</h3>
          <button
            onClick={() => handleCategoryChange("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
              category === ""
                ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                category === cat.slug
                  ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <CategoryIcon slug={cat.slug} className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Ordenar */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Ordenar</h3>
          <button
            type="button"
            onClick={() => handleSortChange("price")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
              sortMode === "price"
                ? "bg-amber-400 text-black"
                : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            Mas barato
          </button>
          <button
            type="button"
            onClick={() => handleSortChange("distance")}
            disabled={!location}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
              sortMode === "distance"
                ? "bg-amber-400 text-black"
                : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Mas cercano
          </button>
        </div>

        {/* Ubicacion */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Ubicación</h3>
          <LocationPicker onLocationChange={setLocation} />
          {!location && searched && (
            <p className="text-xs text-gray-500 italic">
              Compartí tu ubicación para ver la distancia a cada sucursal
            </p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar material..."
              className="input input-with-icon"
            />
          </div>
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>

        {/* Mobile controls - visible on mobile only */}
        <div className="lg:hidden space-y-3">
          {/* Location */}
          <LocationPicker onLocationChange={setLocation} />

          {!location && searched && (
            <p className="text-xs text-gray-500 italic">
              Compartí tu ubicación para ver la distancia a cada sucursal
            </p>
          )}

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("")}
              className={`chip flex-shrink-0 ${category === "" ? "chip-active" : "chip-inactive"}`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`chip flex-shrink-0 flex items-center gap-2 ${category === cat.slug ? "chip-active" : "chip-inactive"}`}
              >
                <CategoryIcon slug={cat.slug} className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort toggle */}
          <div className="flex items-center justify-between">
            <div className="flex rounded-xl overflow-hidden border border-gray-800">
              <button
                type="button"
                onClick={() => handleSortChange("price")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  sortMode === "price"
                    ? "bg-amber-400 text-black"
                    : "bg-gray-900 text-gray-400 hover:text-white"
                }`}
              >
                Mas barato
              </button>
              <button
                type="button"
                onClick={() => handleSortChange("distance")}
                disabled={!location}
                className={`px-4 py-2 text-sm font-medium transition ${
                  sortMode === "distance"
                    ? "bg-amber-400 text-black"
                    : "bg-gray-900 text-gray-400 hover:text-white"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Mas cercano
              </button>
            </div>
          </div>
        </div>

        {/* Active filters row */}
        {(category || location) && (
          <div className="flex items-center gap-2 flex-wrap">
            {category && activeCategoryName && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-medium border border-amber-400/40">
                {activeCategoryName}
                <button
                  onClick={() => handleCategoryChange("")}
                  className="ml-1 hover:text-white"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-400/20 text-blue-400 text-xs font-medium border border-blue-400/40">
                Ubicación activa
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-white underline ml-2"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Results count */}
        {searched && !loading && (
          <p className="text-xs text-gray-400">
            {results.length} resultado{results.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Results */}
        {loading && <Spinner />}

        {!loading && searched && results.length === 0 && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white">No se encontraron ofertas</p>
            <p className="text-sm text-gray-400 mt-1">Proba con otro termino o categoria</p>
          </div>
        )}

        {/* Results list */}
        <div className="space-y-4">
          {results.map((offer) => (
            <Link key={offer.offer_id} href={`/offer/${offer.offer_id}`}>
              <div className="result-row bg-[#0D1117] rounded-xl p-4 border border-gray-800/50">
                <div className="flex items-start gap-3">
                  {/* Product image */}
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <Image src={offer.product_image_url || "/images/logotipo.png"} alt={offer.product_name} width={48} height={48} className="object-contain w-full h-full p-1" />
                  </div>
                  {/* Product info + price */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm leading-snug">{offer.product_name}</h3>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{offer.vendor_name} — {offer.branch_name}</p>
                    {/* Price + meta row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-lg font-bold text-amber-400">${offer.price.toLocaleString("es-AR")}</span>
                      <span className="text-xs text-gray-500">/{offer.product_unit}</span>
                      <span className={getBadgeClass(offer.stock_status)}>
                        {STOCK_LABELS[offer.stock_status]}
                      </span>
                      {offer.distance_km !== null && (
                        <span className="text-xs text-gray-400">{formatDistance(offer.distance_km)}</span>
                      )}
                      {offer.branch_free_shipping && offer.distance_km !== null && offer.branch_free_shipping_radius_km !== null && offer.distance_km <= offer.branch_free_shipping_radius_km && (
                        <span className="text-[10px] text-emerald-400 font-semibold">Envío gratis</span>
                      )}
                      {offer.offer_updated_at && (
                        <span className="text-[10px] text-gray-600 ml-auto">
                          Act. {new Date(offer.offer_updated_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchContent />
    </Suspense>
  );
}
