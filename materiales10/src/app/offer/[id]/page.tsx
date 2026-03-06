"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner, Toast } from "@/components";
import { fetchOfferById, createOrder, STOCK_LABELS, STOCK_COLORS, loadLocation, formatDistance, haversine, getGoogleMapsUrl } from "@/lib";
import type { SearchOfferResult } from "@/lib/database.types";

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<SearchOfferResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const data = await fetchOfferById(id);
      if (data) {
        // Calculate distance if we have buyer location
        const loc = loadLocation();
        if (loc && data.branch_lat && data.branch_lng) {
          data.distance_km = haversine(loc.lat, loc.lng, data.branch_lat, data.branch_lng);
        }
        setOffer(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleReserve() {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      setToast({ msg: "Ingresá tu nombre y teléfono", type: "error" });
      return;
    }

    setReserving(true);
    try {
      const orderId = await createOrder({
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        notes: notes.trim() || undefined,
        items: [
          {
            offerId: id,
            quantity,
            priceSnapshot: offer?.price ?? 0,
          },
        ],
      });
      router.push(`/order/success?order_id=${orderId}`);
    } catch (err) {
      setToast({ msg: "Error al crear reserva", type: "error" });
      setReserving(false);
    }
  }

  if (loading) return <Spinner />;
  if (!offer) return <p className="text-center text-gray-400 py-12">Oferta no encontrada</p>;

  const stockClass = STOCK_COLORS[offer.stock_status] ?? "";
  const stockLabel = STOCK_LABELS[offer.stock_status] ?? offer.stock_status;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => router.back()} className="text-sm text-amber-400 hover:underline">
        ← Volver
      </button>

      {/* Product info */}
      <div className="card p-5 space-y-3">
        <h1 className="text-xl font-bold text-white">{offer.product_name}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl font-bold text-amber-400">
            ${offer.price.toLocaleString("es-AR")}
          </span>
          <span className="text-sm text-gray-400">/{offer.product_unit}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockClass}`}>
            {stockLabel}
          </span>
        </div>
      </div>

      {/* Branch info */}
      <div className="card p-5 space-y-2">
        <h2 className="font-semibold text-sm text-amber-400 uppercase tracking-wide">Vendedor</h2>
        <p className="font-medium text-white">{offer.vendor_name}</p>
        <p className="text-sm text-gray-400">
          {offer.branch_name} — {offer.branch_address}, {offer.branch_city}
        </p>
        {offer.distance_km !== null && (
          <p className="text-sm text-gray-500">Distancia: {formatDistance(offer.distance_km)}</p>
        )}
        {offer.branch_free_shipping && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-green-400">
              🚚 Envío gratis
              {offer.branch_free_shipping_radius_km ? ` hasta ${offer.branch_free_shipping_radius_km} km` : ""}
            </span>
            {offer.distance_km !== null && offer.branch_free_shipping_radius_km && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                offer.distance_km <= offer.branch_free_shipping_radius_km
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-800 text-gray-400"
              }`}>
                {offer.distance_km <= offer.branch_free_shipping_radius_km
                  ? "Estás dentro del radio"
                  : "Fuera del radio"}
              </span>
            )}
          </div>
        )}
        <div className="flex gap-3 mt-2 flex-wrap">
          {offer.branch_phone && (
            <a href={`tel:${offer.branch_phone}`} className="text-sm text-amber-400 hover:underline">
              📞 Llamar
            </a>
          )}
          {offer.branch_whatsapp && (
            <a
              href={`https://wa.me/${offer.branch_whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola! Vi "${offer.product_name}" a $${offer.price.toLocaleString("es-AR")} en ConstructNOA y quería consultar disponibilidad. Gracias!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-400 hover:underline"
            >
              💬 WhatsApp
            </a>
          )}
          {(() => {
            const mapsUrl = getGoogleMapsUrl(offer.branch_lat, offer.branch_lng, offer.branch_address, offer.branch_city);
            return mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline"
              >
                📍 Ver ubicación
              </a>
            ) : null;
          })()}
        </div>
      </div>

      {/* Reserve CTA */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary w-full text-lg py-4"
        >
          Reservar
        </button>
      ) : (
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-white">Datos para la reserva</h2>
          <input
            type="text"
            placeholder="Tu nombre"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="input"
          />
          <input
            type="tel"
            placeholder="Tu teléfono"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            className="input"
          />
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-400">Cantidad:</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="input w-20"
            />
            <span className="text-sm text-gray-400">{offer.product_unit}</span>
          </div>
          <textarea
            placeholder="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleReserve}
              disabled={reserving}
              className="btn-primary flex-1"
            >
              {reserving ? "Enviando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
