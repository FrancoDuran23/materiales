// Geocoding utilities using Google Maps Geocoding API

export interface GeocodingResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id?: string;
}

export interface GeocodingError {
  error: string;
  status: string;
}

export async function geocodeAddress(
  address: string,
  city: string,
  province: string
): Promise<GeocodingResult | GeocodingError> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      error: "API Key de Google Maps no configurada. Contactá al administrador.",
      status: "CONFIG_ERROR",
    };
  }

  // Construct full address query
  const fullAddress = `${address}, ${city}, ${province}, Argentina`;
  const encodedAddress = encodeURIComponent(fullAddress);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}&language=es`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
      };
    }

    if (data.status === "ZERO_RESULTS") {
      return {
        error: "No se encontró la dirección. Verificá que sea correcta.",
        status: "ZERO_RESULTS",
      };
    }

    if (data.status === "OVER_QUERY_LIMIT") {
      return {
        error: "Límite de consultas excedido. Intentá de nuevo en unos minutos.",
        status: "OVER_QUERY_LIMIT",
      };
    }

    if (data.status === "REQUEST_DENIED") {
      return {
        error: "API Key inválida o restricciones de dominio. Contactá al administrador.",
        status: "REQUEST_DENIED",
      };
    }

    return {
      error: `Error de geocodificación: ${data.status}`,
      status: data.status,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      error: "Error de conexión con el servicio de geocodificación.",
      status: "NETWORK_ERROR",
    };
  }
}

export function isGeocodingError(
  result: GeocodingResult | GeocodingError
): result is GeocodingError {
  return "error" in result;
}

// Alternative: Free geocoding with Nominatim (OpenStreetMap)
// Less accurate in Argentina but no API key required

export async function geocodeAddressNominatim(
  address: string,
  city: string,
  province: string
): Promise<GeocodingResult | GeocodingError> {
  const fullAddress = `${address}, ${city}, ${province}, Argentina`;
  const encodedAddress = encodeURIComponent(fullAddress);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          "User-Agent": "Materiales10/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formatted_address: result.display_name,
        place_id: result.place_id?.toString(),
      };
    }

    return {
      error: "No se encontró la dirección. Verificá que sea correcta.",
      status: "ZERO_RESULTS",
    };
  } catch (error) {
    console.error("Nominatim geocoding error:", error);
    return {
      error: "Error de conexión con el servicio de geocodificación.",
      status: "NETWORK_ERROR",
    };
  }
}
