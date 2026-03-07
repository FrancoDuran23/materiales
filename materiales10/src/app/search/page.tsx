"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner, OfferCard, LocationPicker, CategoryIcon } from "@/components";
import { searchOffers, CATEGORIES } from "@/lib";
import type { SearchOfferResult, BuyerLocation } from "@/lib/database.types";

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

  return (
    <div className="space-y-4">
      {/* Search input */}
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

      {/* Location */}
      <LocationPicker onLocationChange={setLocation} />

      {/* Hint when no location */}
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

      {/* Sort + count */}
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
        {searched && (
          <span className="text-xs text-gray-400">
            {results.length} resultado{results.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

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

      <div className="space-y-3">
        {results.map((offer) => (
          <OfferCard key={offer.offer_id} offer={offer} />
        ))}
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
