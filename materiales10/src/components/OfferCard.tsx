"use client";

import Link from "next/link";
import Image from "next/image";
import { STOCK_LABELS } from "@/lib/constants";
import { formatDistance, getGoogleMapsUrl } from "@/lib/geo";
import type { SearchOfferResult } from "@/lib/database.types";

const DEFAULT_PRODUCT_IMAGE = "/images/default-product.svg";

interface Props {
  offer: SearchOfferResult;
}

export default function OfferCard({ offer }: Props) {
  const stockLabel = STOCK_LABELS[offer.stock_status] ?? offer.stock_status;
  const imageUrl = offer.product_image_url || DEFAULT_PRODUCT_IMAGE;

  // Badge styles basados en stock
  const getBadgeClass = () => {
    switch (offer.stock_status) {
      case "disponible":
        return "badge badge-success";
      case "consultar":
        return "badge badge-warning";
      case "sin_stock":
        return "badge badge-error";
      default:
        return "badge badge-neutral";
    }
  };

  return (
    <Link
      href={`/offer/${offer.offer_id}`}
      className="card p-4 hover:border-amber-400/50 transition-all block"
    >
      <div className="flex gap-4">
        {/* Imagen */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-800">
          <Image
            src={imageUrl}
            alt={offer.product_name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-sm text-white truncate">
            {offer.product_name}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            {offer.vendor_name} — {offer.branch_name}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{offer.branch_city}</span>
            {offer.distance_km !== null && (
              <span className="text-amber-400 font-medium">
                {formatDistance(offer.distance_km)}
              </span>
            )}
            {(() => {
              const mapsUrl = getGoogleMapsUrl(offer.branch_lat, offer.branch_lng, offer.branch_address, offer.branch_city);
              return mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-amber-400 transition-colors"
                  title="Ver ubicación"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </a>
              ) : null;
            })()}
          </div>
        </div>

        {/* Precio y Stock */}
        <div className="flex flex-col items-end justify-between">
          <div className="flex flex-col items-end gap-1">
            <span className={getBadgeClass()}>{stockLabel}</span>
            {offer.branch_free_shipping && offer.distance_km != null &&
              offer.branch_free_shipping_radius_km != null &&
              offer.distance_km <= offer.branch_free_shipping_radius_km && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                Envío gratis
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-amber-400">
              ${offer.price.toLocaleString("es-AR")}
            </p>
            <p className="text-xs text-gray-400">/{offer.product_unit}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
