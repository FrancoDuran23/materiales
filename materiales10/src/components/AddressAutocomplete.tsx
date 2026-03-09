"use client";

import { useRef, useEffect, useState } from "react";

export interface AddressResult {
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  required?: boolean;
}

let googleMapsLoaded = false;
let googleMapsLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (googleMapsLoaded) {
      resolve();
      return;
    }
    loadCallbacks.push(resolve);
    if (googleMapsLoading) return;
    googleMapsLoading = true;

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.error("[AddressAutocomplete] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set");
      return;
    }

    // Check if script already exists
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      const g = (window as any).google;
      if (g?.maps?.places) {
        googleMapsLoaded = true;
        loadCallbacks.forEach((cb) => cb());
        loadCallbacks.length = 0;
        return;
      }
      existing.addEventListener("load", () => {
        googleMapsLoaded = true;
        loadCallbacks.forEach((cb) => cb());
        loadCallbacks.length = 0;
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=es`;
    script.async = true;
    script.onload = () => {
      googleMapsLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = (err) => {
      console.error("[AddressAutocomplete] Google Maps script failed to load:", err);
    };
    document.head.appendChild(script);
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function extractComponent(
  components: any[],
  type: string,
  field: "long_name" | "longText" = "long_name"
): string {
  const comp = components.find((c: any) => c.types?.includes(type));
  if (!comp) return "";
  return comp[field] ?? comp.long_name ?? comp.longText ?? "";
}

function parseCity(components: any[], field: "long_name" | "longText" = "long_name"): string {
  return (
    extractComponent(components, "locality", field) ||
    extractComponent(components, "sublocality_level_1", field) ||
    extractComponent(components, "administrative_area_level_2", field) ||
    ""
  );
}

function parseAddress(components: any[], field: "long_name" | "longText" = "long_name", fallbackName?: string): string {
  const streetNumber = extractComponent(components, "street_number", field);
  const route = extractComponent(components, "route", field);
  return streetNumber ? `${route} ${streetNumber}` : route || fallbackName || "";
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Busca una direccion...",
  required = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const onSelectRef = useRef(onSelect);
  const onChangeRef = useRef(onChange);
  onSelectRef.current = onSelect;
  onChangeRef.current = onChange;

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const g = window.google as any;
    if (!g?.maps?.places) {
      setApiError("Google Maps Places no disponible");
      return;
    }

    initLegacyAutocomplete(g, inputRef.current);
  }, [ready]);

  function initLegacyAutocomplete(g: any, input: HTMLInputElement) {
    try {
      const autocomplete = new g.maps.places.Autocomplete(input, {
        componentRestrictions: { country: "ar" },
        fields: ["geometry", "address_components", "formatted_address", "name"],
        types: ["address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place?.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const components = place.address_components ?? [];
        const address = parseAddress(components, "long_name", place.name);
        const city = parseCity(components, "long_name");
        const province = extractComponent(components, "administrative_area_level_1");

        onChangeRef.current(place.formatted_address ?? address);
        onSelectRef.current({ address, city, province, lat, lng });
      });

      autocompleteRef.current = autocomplete;
    } catch (err) {
      console.error("[AddressAutocomplete] Failed to init:", err);
      setApiError("Error al inicializar Google Maps");
    }
  }

  return (
    <div className="relative google-autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={ready ? placeholder : "Cargando mapa..."}
        required={required}
        className="input"
        disabled={!ready}
      />
      {apiError && (
        <p className="text-xs text-red-400 mt-1">{apiError}</p>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
