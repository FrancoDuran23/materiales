"use client";

import { useState, useEffect } from "react";
import { loadLocation, saveLocation, clearLocation, requestGeolocation, cityToCoords } from "@/lib/geo";
import type { BuyerLocation } from "@/lib/database.types";

const NOA_SUGGESTIONS = [
  "Salta",
  "Jujuy",
  "San Pedro",
  "Orán",
  "Tartagal",
  "Palpalá",
  "Tucumán",
];

interface Props {
  onLocationChange: (loc: BuyerLocation | null) => void;
}

export default function LocationPicker({ onLocationChange }: Props) {
  const [location, setLocation] = useState<BuyerLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = loadLocation();
    if (saved) {
      setLocation(saved);
      onLocationChange(saved);
    }
  }, []);

  async function handleGPS() {
    setLoading(true);
    setError("");
    try {
      const loc = await requestGeolocation();
      saveLocation(loc);
      setLocation(loc);
      onLocationChange(loc);
    } catch {
      setError("No se pudo obtener ubicación. Ingresá tu ciudad manualmente.");
      setShowManual(true);
    } finally {
      setLoading(false);
    }
  }

  function selectCity(city: string) {
    const coords = cityToCoords(city);
    if (!coords) {
      setError(`"${city}" no encontrada. Probá escribiendo el nombre completo.`);
      return;
    }
    const loc: BuyerLocation = { ...coords, source: "manual", label: city };
    saveLocation(loc);
    setLocation(loc);
    onLocationChange(loc);
    setShowManual(false);
    setError("");
    setCityInput("");
  }

  function handleManualCity() {
    if (!cityInput.trim()) return;
    selectCity(cityInput.trim());
  }

  function handleClear() {
    clearLocation();
    setLocation(null);
    onLocationChange(null);
    setCityInput("");
    setError("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleGPS}
          disabled={loading}
          className="chip chip-inactive text-xs flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {loading ? "Obteniendo..." : "Usar mi ubicación"}
        </button>
        {!showManual && !location && (
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="text-xs text-amber-400 font-medium hover:text-amber-300 transition-colors"
          >
            Ingresar ciudad
          </button>
        )}
        {location && (
          <>
            <span className="badge badge-success text-xs">
              {location.source === "gps" ? "GPS activo" : location.label ?? "Manual"}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Borrar ubicación
            </button>
          </>
        )}
      </div>

      {showManual && !location && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualCity()}
              placeholder="Ej: Salta, Jujuy, Tucumán, Orán..."
              className="input flex-1 !py-2"
            />
            <button
              type="button"
              onClick={handleManualCity}
              className="btn-primary !py-2 !px-4"
            >
              OK
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {NOA_SUGGESTIONS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => selectCity(city)}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 hover:bg-amber-400/20 hover:text-amber-400 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
