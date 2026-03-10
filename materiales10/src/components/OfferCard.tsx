"use client";

import Link from "next/link";
import Image from "next/image";
import { STOCK_LABELS } from "@/lib/constants";
import { formatDistance, getGoogleMapsUrl } from "@/lib/geo";
import type { SearchOfferResult } from "@/lib/database.types";

const DEFAULT_PRODUCT_IMAGE = "/images/logotipo.png";

interface Props {
  offer: SearchOfferResult;
}

export default function OfferCard({ offer }: Props) {
  const stockLabel = STOCK_LABELS[offer.stock_status] ?? offer.stock_status;
  const imageUrl = offer.product_image_url || DEFAULT_PRODUCT_IMAGE;

  const stockColor =
    offer.stock_status === "disponible"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
      : offer.stock_status === "consultar"
      ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
      : "bg-red-500/15 text-red-400 border-red-500/20";

  const mapsUrl = getGoogleMapsUrl(
    offer.branch_lat,
    offer.branch_lng,
    offer.branch_address,
    offer.branch_city
  );

  return (
    <Link
      href={`/offer/${offer.offer_id}`}
      className="block rounded-2xl bg-[#0D1117] border border-white/[0.06] hover:border-amber-400/30 transition-all overflow-hidden"
    >
      {/* Top: Product name + price */}
      <div className="p-4 pb-3 space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white/[0.05]">
            <Image
              src={imageUrl}
              alt={offer.product_name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-white leading-snug line-clamp-2">
              {offer.product_name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {offer.vendor_name}
            </p>
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-400">
              ${offer.price.toLocaleString("es-AR")}
            </span>
            <span className="text-xs text-gray-500">/{offer.product_unit}</span>
          </div>
          <div className="flex items-center gap-2">
            {offer.offer_updated_at && (
              <span className="text-[10px] text-gray-600">
                Act. {new Date(offer.offer_updated_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${stockColor}`}>
              {stockLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Meta info */}
      <div className="border-t border-white/[0.04] px-4 py-2.5 flex items-center gap-3 text-[11px]">
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-amber-400 transition-colors"
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {offer.branch_city}
          </a>
        ) : (
          <span className="text-gray-500">{offer.branch_city}</span>
        )}
        {offer.distance_km !== null && (
          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {formatDistance(offer.distance_km)}
          </span>
        )}
        {offer.branch_free_shipping &&
          offer.distance_km != null &&
          offer.branch_free_shipping_radius_km != null &&
          offer.distance_km <= offer.branch_free_shipping_radius_km && (
            <span className="text-emerald-400 font-medium">Envío gratis</span>
          )}
      </div>
    </Link>
  );
}
