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
      console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set");
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=es&loading=async`;
    script.async = true;
    script.onload = () => {
      googleMapsLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
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
    if (!g?.maps?.places) return;

    // Try new PlaceAutocompleteElement first
    if (g.maps.places.PlaceAutocompleteElement) {
      try {
        const el = new g.maps.places.PlaceAutocompleteElement({
          componentRestrictions: { country: "ar" },
          types: ["address"],
        });

        // Style the element to match our input
        el.style.width = "100%";

        el.addEventListener("gmp-placeselect", async (event: any) => {
          const place = event.place;
          if (!place) return;

          await place.fetchFields({
            fields: ["displayName", "formattedAddress", "location", "addressComponents"],
          });

          const lat = place.location?.lat();
          const lng = place.location?.lng();
          if (lat == null || lng == null) return;

          const components = place.addressComponents ?? [];
          const streetNumber = extractComponent(components, "street_number", "longText");
          const route = extractComponent(components, "route", "longText");
          const address = streetNumber ? `${route} ${streetNumber}` : route || place.displayName || "";
          const city =
            extractComponent(components, "locality", "longText") ||
            extractComponent(components, "sublocality_level_1", "longText") ||
            extractComponent(components, "administrative_area_level_2", "longText") ||
            "";
          const province = extractComponent(components, "administrative_area_level_1", "longText") || "";

          onChangeRef.current(place.formattedAddress ?? address);
          onSelectRef.current({ address, city, province, lat, lng });
        });

        // Replace input with the Google element
        const container = inputRef.current.parentElement;
        if (container) {
          inputRef.current.style.display = "none";
          container.appendChild(el);
          autocompleteRef.current = el;
        }
        return;
      } catch {
        // Fall through to legacy
      }
    }

    // Legacy Autocomplete fallback
    try {
      const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
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

        const streetNumber = extractComponent(components, "street_number");
        const route = extractComponent(components, "route");
        const address = streetNumber ? `${route} ${streetNumber}` : route || place.name || "";
        const city =
          extractComponent(components, "locality") ||
          extractComponent(components, "sublocality_level_1") ||
          extractComponent(components, "administrative_area_level_2") ||
          "";
        const province = extractComponent(components, "administrative_area_level_1") || "";

        onChangeRef.current(place.formatted_address ?? address);
        onSelectRef.current({ address, city, province, lat, lng });
      });

      autocompleteRef.current = autocomplete;
    } catch {
      // Both APIs failed
      console.error("Google Maps Places API not available");
    }
  }, [ready]);

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
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
