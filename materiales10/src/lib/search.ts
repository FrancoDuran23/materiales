import { getSupabase } from "./supabase";
import type { SearchOfferResult, Category } from "./database.types";

export async function searchOffers(params: {
  q?: string;
  buyerLat?: number | null;
  buyerLng?: number | null;
  categorySlug?: string | null;
  sortMode?: "price" | "distance";
  limit?: number;
  offset?: number;
}): Promise<SearchOfferResult[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("search_offers", {
    p_q: params.q ?? "",
    p_buyer_lat: params.buyerLat ?? null,
    p_buyer_lng: params.buyerLng ?? null,
    p_category_slug: params.categorySlug ?? null,
    p_sort_mode: params.sortMode ?? "price",
    p_lim: params.limit ?? 50,
    p_off: params.offset ?? 0,
  });

  if (error) {
    console.error("searchOffers error:", error);
    return [];
  }

  return (data as SearchOfferResult[]) ?? [];
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, icon")
    .order("name");

  if (error) {
    console.error("fetchCategories error:", error);
    return [];
  }

  return (data as Category[]) ?? [];
}

export async function fetchOfferById(offerId: string): Promise<SearchOfferResult | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("offers")
    .select(`
      id, price, stock_status, image_url,
      product:products(name, unit, category:categories(slug)),
      branch:branches(name, address, city, phone, whatsapp, lat, lng, free_shipping, free_shipping_radius_km,
        vendor:vendors(name)
      )
    `)
    .eq("id", offerId)
    .single();

  if (error || !data) {
    console.error("fetchOfferById error:", error);
    return null;
  }

  // Transform to SearchOfferResult shape
  const p = data.product as unknown as { name: string; unit: string; category: { slug: string } };
  const b = data.branch as unknown as {
    name: string;
    address: string;
    city: string;
    phone: string | null;
    whatsapp: string | null;
    lat: number | null;
    lng: number | null;
    free_shipping: boolean;
    free_shipping_radius_km: number | null;
    vendor: { name: string };
  };

  return {
    offer_id: data.id,
    product_name: p?.name ?? "",
    product_unit: p?.unit ?? "",
    product_image_url: (data as Record<string, unknown>).image_url as string | null,
    category_slug: p?.category?.slug ?? "",
    price: data.price,
    stock_status: data.stock_status,
    vendor_name: b?.vendor?.name ?? "",
    branch_name: b?.name ?? "",
    branch_city: b?.city ?? "",
    branch_address: b?.address ?? "",
    branch_phone: b?.phone ?? null,
    branch_whatsapp: b?.whatsapp ?? null,
    branch_lat: b?.lat ?? null,
    branch_lng: b?.lng ?? null,
    distance_km: null,
    branch_free_shipping: b?.free_shipping ?? false,
    branch_free_shipping_radius_km: b?.free_shipping_radius_km ?? null,
  };
}
