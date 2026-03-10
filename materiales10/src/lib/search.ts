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

export interface OfferDetail extends SearchOfferResult {
  product_id: string;
  branch_id: string;
  category_name: string;
}

export async function fetchOfferById(offerId: string): Promise<OfferDetail | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("offers")
    .select(`
      id, price, stock_status, image_url, product_id, branch_id, updated_at,
      product:products(name, unit, image_url, category:categories(slug, name)),
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

  const p = data.product as unknown as { name: string; unit: string; image_url: string | null; category: { slug: string; name: string } };
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

  const offerImageUrl = (data as Record<string, unknown>).image_url as string | null;
  const productImageUrl = p?.image_url ?? null;

  return {
    offer_id: data.id,
    product_id: data.product_id,
    branch_id: data.branch_id,
    product_name: p?.name ?? "",
    product_unit: p?.unit ?? "",
    product_image_url: offerImageUrl || productImageUrl,
    category_slug: p?.category?.slug ?? "",
    category_name: p?.category?.name ?? "",
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
    offer_updated_at: (data as Record<string, unknown>).updated_at as string | null,
  };
}

/** Fetch other offers for the same product (price comparison) */
export async function fetchSameProductOffers(
  productId: string,
  excludeOfferId: string,
  limit = 5
): Promise<SearchOfferResult[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("offers")
    .select(`
      id, price, stock_status, image_url, product_id, updated_at,
      product:products(name, unit, image_url, category:categories(slug)),
      branch:branches(name, address, city, phone, whatsapp, lat, lng, free_shipping, free_shipping_radius_km,
        vendor:vendors(name)
      )
    `)
    .eq("product_id", productId)
    .neq("id", excludeOfferId)
    .order("price", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const p = row.product as unknown as { name: string; unit: string; image_url: string | null; category: { slug: string } };
    const b = row.branch as unknown as {
      name: string; address: string; city: string;
      phone: string | null; whatsapp: string | null;
      lat: number | null; lng: number | null;
      free_shipping: boolean; free_shipping_radius_km: number | null;
      vendor: { name: string };
    };
    const offerImg = (row as Record<string, unknown>).image_url as string | null;
    return {
      offer_id: row.id,
      product_name: p?.name ?? "",
      product_unit: p?.unit ?? "",
      product_image_url: offerImg || p?.image_url || null,
      category_slug: p?.category?.slug ?? "",
      price: row.price,
      stock_status: row.stock_status,
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
      offer_updated_at: (row as Record<string, unknown>).updated_at as string | null,
    };
  });
}

/** Fetch more offers from the same branch (cross-sell) */
export async function fetchBranchOffers(
  branchId: string,
  excludeOfferId: string,
  limit = 10
): Promise<SearchOfferResult[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("offers")
    .select(`
      id, price, stock_status, image_url, updated_at,
      product:products(name, unit, image_url, category:categories(slug)),
      branch:branches(name, address, city, phone, whatsapp, lat, lng, free_shipping, free_shipping_radius_km,
        vendor:vendors(name)
      )
    `)
    .eq("branch_id", branchId)
    .neq("id", excludeOfferId)
    .order("price", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const p = row.product as unknown as { name: string; unit: string; image_url: string | null; category: { slug: string } };
    const b = row.branch as unknown as {
      name: string; address: string; city: string;
      phone: string | null; whatsapp: string | null;
      lat: number | null; lng: number | null;
      free_shipping: boolean; free_shipping_radius_km: number | null;
      vendor: { name: string };
    };
    const offerImg = (row as Record<string, unknown>).image_url as string | null;
    return {
      offer_id: row.id,
      product_name: p?.name ?? "",
      product_unit: p?.unit ?? "",
      product_image_url: offerImg || p?.image_url || null,
      category_slug: p?.category?.slug ?? "",
      price: row.price,
      stock_status: row.stock_status,
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
      offer_updated_at: (row as Record<string, unknown>).updated_at as string | null,
    };
  });
}
