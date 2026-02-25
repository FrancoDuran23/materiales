import type { BuyerLocation } from "./database.types";

const STORAGE_KEY = "constructnoa_location";

// Coordenadas aproximadas de principales ciudades de Argentina
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Buenos Aires
  "buenos aires": { lat: -34.6037, lng: -58.3816 },
  "caba": { lat: -34.6037, lng: -58.3816 },
  "capital federal": { lat: -34.6037, lng: -58.3816 },
  "la plata": { lat: -34.9205, lng: -57.9536 },
  "mar del plata": { lat: -38.0055, lng: -57.5426 },
  "bahia blanca": { lat: -38.7196, lng: -62.2724 },

  // Córdoba
  "cordoba": { lat: -31.4201, lng: -64.1888 },
  "villa carlos paz": { lat: -31.4241, lng: -64.4978 },
  "rio cuarto": { lat: -33.1307, lng: -64.3499 },

  // Santa Fe
  "rosario": { lat: -32.9468, lng: -60.6393 },
  "santa fe": { lat: -31.6107, lng: -60.6973 },

  // Mendoza
  "mendoza": { lat: -32.8895, lng: -68.8458 },
  "san rafael": { lat: -34.6176, lng: -68.3301 },

  // Tucumán
  "tucuman": { lat: -26.8083, lng: -65.2176 },
  "san miguel de tucuman": { lat: -26.8083, lng: -65.2176 },
  "yerba buena": { lat: -26.8167, lng: -65.2833 },
  "tafi viejo": { lat: -26.7333, lng: -65.2500 },
  "concepcion": { lat: -27.3333, lng: -65.5833 },
  "banda del rio sali": { lat: -26.8500, lng: -65.1667 },

  // Salta
  "salta": { lat: -24.7821, lng: -65.4232 },
  "salta capital": { lat: -24.7821, lng: -65.4232 },
  "oran": { lat: -23.1358, lng: -64.3249 },
  "tartagal": { lat: -22.5156, lng: -63.8012 },
  "cafayate": { lat: -26.0722, lng: -65.9769 },
  "cerrillos": { lat: -24.8958, lng: -65.4861 },
  "san lorenzo": { lat: -24.7275, lng: -65.4967 },
  "vaqueros": { lat: -24.6983, lng: -65.4108 },
  "la merced": { lat: -24.9833, lng: -65.4833 },
  "metan": { lat: -25.4969, lng: -64.9728 },
  "rosario de la frontera": { lat: -25.7989, lng: -64.9706 },
  "general guemes": { lat: -24.6667, lng: -65.05 },
  "embarcacion": { lat: -23.2167, lng: -64.0833 },

  // Jujuy
  "san salvador de jujuy": { lat: -24.1858, lng: -65.2995 },
  "jujuy": { lat: -24.1858, lng: -65.2995 },
  "san pedro de jujuy": { lat: -24.2315, lng: -64.8686 },
  "san pedro": { lat: -24.2315, lng: -64.8686 },
  "palpala": { lat: -24.2573, lng: -65.213 },
  "libertador": { lat: -23.8047, lng: -64.7917 },
  "monterrico": { lat: -24.2167, lng: -65.2333 },
  "el carmen": { lat: -24.3833, lng: -65.2667 },
  "humahuaca": { lat: -23.2050, lng: -65.3506 },
  "tilcara": { lat: -23.5783, lng: -65.3953 },
  "la quiaca": { lat: -22.1044, lng: -65.5928 },
  "fraile pintado": { lat: -23.9417, lng: -64.8028 },

  // Neuquén
  "neuquen": { lat: -38.9516, lng: -68.0591 },

  // Chubut
  "comodoro rivadavia": { lat: -45.8656, lng: -67.4997 },
  "rawson": { lat: -43.3002, lng: -65.1023 },

  // Entre Ríos
  "parana": { lat: -31.7413, lng: -60.5115 },
  "concordia": { lat: -31.3929, lng: -58.0207 },

  // Corrientes
  "corrientes": { lat: -27.4692, lng: -58.8306 },

  // Misiones
  "posadas": { lat: -27.3621, lng: -55.8969 },

  // Chaco
  "resistencia": { lat: -27.4606, lng: -58.9839 },

  // San Juan
  "san juan": { lat: -31.5375, lng: -68.5364 },

  // San Luis
  "san luis": { lat: -33.3017, lng: -66.3378 },

  // La Rioja
  "la rioja": { lat: -29.4131, lng: -66.8559 },

  // Catamarca
  "catamarca": { lat: -28.4696, lng: -65.7795 },
  "san fernando del valle de catamarca": { lat: -28.4696, lng: -65.7795 },

  // Santiago del Estero
  "santiago del estero": { lat: -27.7951, lng: -64.2615 },

  // Formosa
  "formosa": { lat: -26.1775, lng: -58.1781 },

  // La Pampa
  "santa rosa": { lat: -36.6167, lng: -64.2833 },

  // Río Negro
  "viedma": { lat: -40.8135, lng: -62.9967 },
  "bariloche": { lat: -41.1335, lng: -71.3103 },
  "san carlos de bariloche": { lat: -41.1335, lng: -71.3103 },

  // Santa Cruz
  "rio gallegos": { lat: -51.6226, lng: -69.2181 },

  // Tierra del Fuego
  "ushuaia": { lat: -54.8019, lng: -68.3030 },
};

export function saveLocation(loc: BuyerLocation): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  }
}

export function loadLocation(): BuyerLocation | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BuyerLocation;
  } catch {
    return null;
  }
}

export function clearLocation(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function cityToCoords(city: string): { lat: number; lng: number } | null {
  const key = city.toLowerCase().trim();
  return CITY_COORDS[key] ?? null;
}

export function requestGeolocation(): Promise<BuyerLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalización no soportada"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "gps",
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

export function formatDistance(km: number | null): string {
  if (km === null || km === undefined) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getGoogleMapsUrl(
  lat?: number | null,
  lng?: number | null,
  address?: string | null,
  city?: string | null
): string | null {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const parts = [address, city].filter(Boolean).join(", ");
  if (parts) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  }
  return null;
}
