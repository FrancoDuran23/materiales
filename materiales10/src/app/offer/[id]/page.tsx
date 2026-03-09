"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@/components";
import {
  fetchOfferById,
  fetchSameProductOffers,
  fetchBranchOffers,
  STOCK_LABELS,
  STOCK_COLORS,
  loadLocation,
  formatDistance,
  haversine,
  getGoogleMapsUrl,
} from "@/lib";
import type { OfferDetail } from "@/lib/search";
import type { SearchOfferResult } from "@/lib/database.types";

const DEFAULT_IMAGE = "/images/logotipo.png";

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [competitors, setCompetitors] = useState<SearchOfferResult[]>([]);
  const [crossSell, setCrossSell] = useState<SearchOfferResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchOfferById(id);
      if (!data) {
        setLoading(false);
        return;
      }

      const loc = loadLocation();
      if (loc && data.branch_lat && data.branch_lng) {
        data.distance_km = haversine(loc.lat, loc.lng, data.branch_lat, data.branch_lng);
      }
      setOffer(data);

      // Load price comparison and cross-sell in parallel
      const [comp, cross] = await Promise.all([
        fetchSameProductOffers(data.product_id, data.offer_id),
        fetchBranchOffers(data.branch_id, data.offer_id),
      ]);

      // Calculate distances for competitors
      if (loc) {
        for (const c of comp) {
          if (c.branch_lat && c.branch_lng) {
            c.distance_km = haversine(loc.lat, loc.lng, c.branch_lat, c.branch_lng);
          }
        }
      }

      setCompetitors(comp);
      setCrossSell(cross);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <Spinner />;
  if (!offer) return <p className="text-center text-gray-400 py-12">Oferta no encontrada</p>;

  const stockClass = STOCK_COLORS[offer.stock_status] ?? "";
  const stockLabel = STOCK_LABELS[offer.stock_status] ?? offer.stock_status;
  const imageUrl = offer.product_image_url || DEFAULT_IMAGE;

  const whatsappUrl = offer.branch_whatsapp
    ? `https://wa.me/${offer.branch_whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola! Vi "${offer.product_name}" a $${offer.price.toLocaleString("es-AR")} en ConstructNOA y quería consultar disponibilidad.`
      )}`
    : null;

  const mapsUrl = getGoogleMapsUrl(offer.branch_lat, offer.branch_lng, offer.branch_address, offer.branch_city);

  // Check if current offer is the cheapest
  const isCheapest = competitors.length === 0 || offer.price <= Math.min(...competitors.map((c) => c.price));

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Product + Price Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0D1117] border border-white/[0.06]">
        <span className="absolute -top-4 -right-2 text-[8rem] font-black text-white/[0.02] leading-none select-none pointer-events-none">
          $
        </span>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/[0.05] flex-shrink-0 overflow-hidden relative">
              <Image
                src={imageUrl}
                alt={offer.product_name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                {offer.category_name}
              </span>
              <h1 className="text-lg font-bold text-white leading-tight mt-0.5">
                {offer.product_name}
              </h1>
            </div>
            <span
              className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                offer.stock_status === "disponible"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : offer.stock_status === "consultar"
                  ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                  : "bg-red-500/15 text-red-400 border border-red-500/20"
              }`}
            >
              {stockLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-2 border-t border-white/[0.06] pt-4">
            <span className="text-3xl font-black text-amber-400 tracking-tight">
              ${offer.price.toLocaleString("es-AR")}
            </span>
            <span className="text-sm text-gray-500">/{offer.product_unit}</span>
          </div>
        </div>
      </div>

      {/* Vendor Card */}
      <div className="rounded-2xl bg-[#0D1117] border border-white/[0.06] overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-amber-400">
                {offer.vendor_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white text-sm truncate">{offer.vendor_name}</h2>
              <p className="text-xs text-gray-500 truncate">
                {offer.branch_name} — {offer.branch_address}, {offer.branch_city}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {offer.distance_km !== null && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-400/10 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                {formatDistance(offer.distance_km)}
              </span>
            )}
            {offer.branch_free_shipping && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Envío gratis
                {offer.branch_free_shipping_radius_km ? ` (${offer.branch_free_shipping_radius_km} km)` : ""}
              </span>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 font-medium bg-blue-400/10 px-2.5 py-1 rounded-full hover:bg-blue-400/20 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Mapa
              </a>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-white/[0.06] p-3 flex gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold py-3.5 rounded-xl text-sm transition-all active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </a>
          )}
          {offer.branch_phone && (
            <a
              href={`tel:${offer.branch_phone}`}
              className="flex items-center justify-center gap-2 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 font-medium py-3.5 px-5 rounded-xl text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Llamar
            </a>
          )}
        </div>
      </div>

      {/* Price Comparison */}
      {competitors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Comparar precios</h2>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-gray-600">{competitors.length + 1} corralones</span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            {/* Current offer - highlighted */}
            <div className="bg-amber-400/[0.06] border-l-[3px] border-l-amber-400 px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{offer.vendor_name}</p>
                {offer.distance_km !== null && (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    {formatDistance(offer.distance_km)}
                  </p>
                )}
              </div>
              <span className="text-base font-bold text-amber-400">
                ${offer.price.toLocaleString("es-AR")}
              </span>
              {isCheapest && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 font-bold uppercase tracking-wider">
                  Mejor
                </span>
              )}
            </div>

            {/* Competitors */}
            {competitors.map((comp) => {
              const diff = comp.price - offer.price;
              const compWhatsapp = comp.branch_whatsapp
                ? `https://wa.me/${comp.branch_whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hola! Vi "${comp.product_name}" a $${comp.price.toLocaleString("es-AR")} en ConstructNOA y quería consultar disponibilidad.`
                  )}`
                : null;

              return (
                <div key={comp.offer_id}>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="bg-[#0D1117] px-4 py-3 flex items-center gap-3">
                    <Link href={`/offer/${comp.offer_id}`} className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 truncate hover:text-white transition-colors">
                        {comp.vendor_name}
                      </p>
                      {comp.distance_km !== null && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          {formatDistance(comp.distance_km)}
                        </p>
                      )}
                    </Link>
                    <div className="text-right">
                      <span className="text-base font-bold text-white">
                        ${comp.price.toLocaleString("es-AR")}
                      </span>
                      {diff !== 0 && (
                        <p className={`text-[10px] ${diff > 0 ? "text-red-400" : "text-emerald-400"}`}>
                          {diff > 0 ? "+" : "-"}${Math.abs(diff).toLocaleString("es-AR")}
                        </p>
                      )}
                    </div>
                    {compWhatsapp && (
                      <a
                        href={compWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 hover:bg-[#25D366]/20 transition-colors"
                      >
                        <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cross-sell: More from this vendor */}
      {crossSell.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Más de {offer.vendor_name.split(" ")[0]}
            </h2>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-gray-600">{crossSell.length} productos</span>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {crossSell.map((item) => (
              <Link
                key={item.offer_id}
                href={`/offer/${item.offer_id}`}
                className="flex-shrink-0 w-32 bg-[#0D1117] rounded-xl border border-white/[0.06] p-3 space-y-2 hover:border-amber-400/30 transition-all group"
              >
                <div className="w-full aspect-square rounded-lg bg-white/[0.04] overflow-hidden relative">
                  <Image
                    src={item.product_image_url || DEFAULT_IMAGE}
                    alt={item.product_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="128px"
                  />
                </div>
                <p className="text-[11px] font-medium text-gray-300 truncate group-hover:text-white transition-colors">
                  {item.product_name}
                </p>
                <p className="text-sm font-bold text-amber-400">
                  ${item.price.toLocaleString("es-AR")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
