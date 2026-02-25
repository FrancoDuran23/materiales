"use client";

import { useRef, useEffect, useState, useCallback } from "react";

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=es`;
    script.async = true;
    script.onload = () => {
      googleMapsLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

function extractComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string
): string {
  return components.find((c) => c.types.includes(type))?.long_name ?? "";
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Buscá una dirección...",
  required = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);

  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const components = place.address_components ?? [];

    // Extract street address
    const streetNumber = extractComponent(components, "street_number");
    const route = extractComponent(components, "route");
    const address = streetNumber ? `${route} ${streetNumber}` : route || place.name || "";

    // Extract city - try locality first, then sublocality, then admin_area_level_2
    const city =
      extractComponent(components, "locality") ||
      extractComponent(components, "sublocality_level_1") ||
      extractComponent(components, "administrative_area_level_2") ||
      "";

    // Extract province
    const province = extractComponent(components, "administrative_area_level_1") || "";

    onChange(place.formatted_address ?? address);
    onSelect({ address, city, province, lat, lng });
  }, [onChange, onSelect]);

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "ar" },
      fields: ["geometry", "address_components", "formatted_address", "name"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", handlePlaceSelect);
    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [ready, handlePlaceSelect]);

  return (
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
  );
}
