import type { Category } from "./database.types";

// Categorías hardcodeadas para el Home (también están en la DB)
export const CATEGORIES: Category[] = [
  { id: "1", name: "Plomería", slug: "plomeria", icon: "🔧" },
  { id: "2", name: "Albañilería", slug: "albanileria", icon: "🧱" },
  { id: "3", name: "Electricidad", slug: "electricidad", icon: "⚡" },
  { id: "4", name: "Gas", slug: "gas", icon: "🔥" },
  { id: "5", name: "Ferretería", slug: "ferreteria", icon: "🔩" },
  { id: "6", name: "Herrajes", slug: "herrajes", icon: "🚪" },
  { id: "7", name: "Pintura", slug: "pinturas", icon: "🎨" },
];

export const STOCK_LABELS: Record<string, string> = {
  disponible: "Disponible",
  consultar: "Consultar",
  sin_stock: "Sin stock",
};

export const STOCK_COLORS: Record<string, string> = {
  disponible: "bg-green-100 text-green-800",
  consultar: "bg-yellow-100 text-yellow-800",
  sin_stock: "bg-red-100 text-red-800",
};

// Provincias de Argentina (ordenadas alfabéticamente)
export const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];
