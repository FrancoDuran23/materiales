import { getSupabase } from "./supabase";
import type { Vendor, Branch, Offer, Product, StockStatus } from "./database.types";

// ─── Vendor ───

export async function fetchMyVendor(userId: string): Promise<Vendor | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .select("id, owner_id, name, phone, whatsapp, email, is_active")
    .eq("owner_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("fetchMyVendor error:", error);
  }

  return data as Vendor | null;
}

// Buscar vendedor por email y vincularlo al usuario si no tiene owner
export async function claimVendorByEmail(userId: string, email: string): Promise<Vendor | null> {
  const supabase = getSupabase();

  // Buscar vendedor con ese email que no tenga owner
  const { data: vendor, error: fetchError } = await supabase
    .from("vendors")
    .select("id, owner_id, name, phone, whatsapp, email, is_active")
    .eq("email", email.toLowerCase())
    .is("owner_id", null)
    .single();

  if (fetchError || !vendor) {
    return null;
  }

  // Vincular el vendedor al usuario
  const { error: updateError } = await supabase
    .from("vendors")
    .update({ owner_id: userId })
    .eq("id", vendor.id);

  if (updateError) {
    console.error("claimVendorByEmail update error:", updateError);
    return null;
  }

  return { ...vendor, owner_id: userId } as Vendor;
}

export async function createVendor(
  userId: string,
  name: string,
  email?: string,
  phone?: string,
  whatsapp?: string
): Promise<Vendor> {
  if (!name?.trim()) {
    throw new Error("El nombre del negocio es obligatorio");
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .insert({
      owner_id: userId,
      name: name.trim(),
      email: email?.trim().toLowerCase() || null,
      phone: phone?.trim() || null,
      whatsapp: whatsapp?.trim() || null,
      is_active: false, // Pendiente de aprobación por admin
    })
    .select("id, owner_id, name, phone, whatsapp, is_active, email")
    .single();

  if (error) {
    console.error("createVendor error:", error);
    if (error.code === "23505") {
      throw new Error("Ya existe un negocio registrado con este email");
    }
    throw new Error(`Error al registrar negocio: ${error.message}`);
  }
  return data as Vendor;
}

// ─── Branch ───

export async function fetchMyBranches(vendorId: string): Promise<Branch[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("branches")
    .select("id, vendor_id, name, address, city, province, lat, lng, phone, whatsapp, is_active")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchMyBranches error:", error);
    return [];
  }

  return (data as Branch[]) ?? [];
}

export async function createBranch(
  vendorId: string,
  data: {
    name: string;
    address: string;
    city: string;
    province: string;
    lat?: number;
    lng?: number;
    phone?: string;
    whatsapp?: string;
    free_shipping?: boolean;
    free_shipping_radius_km?: number;
  }
): Promise<Branch> {
  // Validaciones
  if (!data.name?.trim()) {
    throw new Error("El nombre de la sucursal es obligatorio");
  }
  if (!data.address?.trim()) {
    throw new Error("La dirección es obligatoria");
  }
  if (!data.city?.trim()) {
    throw new Error("La ciudad es obligatoria");
  }

  const supabase = getSupabase();

  // Contar sucursales activas del vendor para determinar si esta debe estar activa
  const { count: activeBranchCount } = await supabase
    .from("branches")
    .select("id", { count: "exact", head: true })
    .eq("vendor_id", vendorId)
    .eq("is_active", true);

  // Primera sucursal gratis (activa), las demás inactivas
  const shouldBeActive = (activeBranchCount ?? 0) === 0;

  const { data: result, error } = await supabase
    .from("branches")
    .insert({
      vendor_id: vendorId,
      name: data.name.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      province: data.province,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      phone: data.phone?.trim() ?? null,
      whatsapp: data.whatsapp?.trim() ?? null,
      free_shipping: data.free_shipping ?? false,
      free_shipping_radius_km: data.free_shipping_radius_km ?? null,
      is_active: shouldBeActive,
    })
    .select("id, vendor_id, name, address, city, province, lat, lng, phone, whatsapp, free_shipping, free_shipping_radius_km, is_active")
    .single();

  if (error) {
    console.error("createBranch error:", error);
    if (error.code === "42501" || error.message?.includes("policy")) {
      throw new Error("No tenés permiso para crear sucursales. Tu cuenta debe estar aprobada.");
    }
    if (error.code === "23505") {
      throw new Error("Ya existe una sucursal con ese nombre");
    }
    throw new Error(`Error al crear sucursal: ${error.message}`);
  }

  return result as Branch;
}

export async function updateBranch(
  branchId: string,
  data: {
    name?: string;
    address?: string;
    city?: string;
    province?: string;
    lat?: number | null;
    lng?: number | null;
    phone?: string | null;
    whatsapp?: string | null;
    free_shipping?: boolean;
    free_shipping_radius_km?: number | null;
  }
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("branches")
    .update({
      ...data,
      name: data.name?.trim(),
      address: data.address?.trim(),
      city: data.city?.trim(),
      phone: data.phone?.trim() || null,
      whatsapp: data.whatsapp?.trim() || null,
    })
    .eq("id", branchId);

  if (error) {
    console.error("updateBranch error:", error);
    if (error.code === "42501" || error.message?.includes("policy")) {
      throw new Error("No tenés permiso para editar esta sucursal");
    }
    throw new Error(`Error al actualizar sucursal: ${error.message}`);
  }
}

// ─── Products ───

export async function fetchProducts(search?: string): Promise<Product[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("products")
    .select("id, name, category_id, unit")
    .order("name");

  if (search && search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error("fetchProducts error:", error);
    return [];
  }

  return (data as Product[]) ?? [];
}

// ─── Offers ───

export interface OfferWithProduct extends Offer {
  product: { name: string; unit: string };
  branch: { name: string; city: string };
}

export async function fetchMyOffers(branchIds: string[]): Promise<OfferWithProduct[]> {
  if (branchIds.length === 0) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("offers")
    .select(`
      id, branch_id, product_id, price, stock_status, image_url,
      product:products(name, unit),
      branch:branches(name, city)
    `)
    .in("branch_id", branchIds)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("fetchMyOffers error:", error);
    return [];
  }

  return (data as unknown as OfferWithProduct[]) ?? [];
}

export async function createOffer(
  branchId: string,
  productId: string,
  price: number,
  stockStatus: StockStatus,
  imageUrl?: string | null
): Promise<Offer> {
  if (!branchId) {
    throw new Error("Debés seleccionar una sucursal");
  }
  if (!productId) {
    throw new Error("Debés seleccionar un producto");
  }
  if (!price || price <= 0) {
    throw new Error("El precio debe ser mayor a 0");
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("offers")
    .insert({
      branch_id: branchId,
      product_id: productId,
      price,
      stock_status: stockStatus,
      image_url: imageUrl ?? null,
    })
    .select("id, branch_id, product_id, price, stock_status, image_url")
    .single();

  if (error) {
    console.error("createOffer error:", error);
    if (error.code === "42501" || error.message?.includes("policy")) {
      throw new Error("No tenés permiso para crear ofertas. Tu cuenta debe estar aprobada.");
    }
    if (error.code === "23505") {
      throw new Error("Ya existe una oferta para este producto en esta sucursal");
    }
    if (error.code === "23503") {
      throw new Error("El producto o sucursal seleccionado no existe");
    }
    throw new Error(`Error al crear oferta: ${error.message}`);
  }
  return data as Offer;
}

export async function updateOffer(
  offerId: string,
  updates: { price?: number; stock_status?: StockStatus; image_url?: string | null }
): Promise<void> {
  if (updates.price !== undefined && updates.price <= 0) {
    throw new Error("El precio debe ser mayor a 0");
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("offers")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", offerId);

  if (error) {
    console.error("updateOffer error:", error);
    if (error.code === "42501" || error.message?.includes("policy")) {
      throw new Error("No tenés permiso para editar esta oferta");
    }
    throw new Error(`Error al actualizar oferta: ${error.message}`);
  }
}

export async function uploadOfferImage(file: File): Promise<string> {
  console.log("=== DEBUG uploadOfferImage ===");
  console.log("File name:", file.name);
  console.log("File size:", file.size, "bytes");
  console.log("File type:", file.type);

  // Validar tamaño (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen es muy grande. Máximo 5MB.");
  }

  // Validar tipo
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Formato no válido. Usá JPG, PNG, WebP o GIF.");
  }

  const supabase = getSupabase();

  // Check auth status
  const { data: authData } = await supabase.auth.getSession();
  console.log("Auth session exists:", !!authData.session);
  console.log("User ID:", authData.session?.user?.id ?? "NO USER");

  // List buckets to verify connection
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  console.log("Available buckets:", buckets?.map(b => b.name) ?? "ERROR");
  if (bucketsError) {
    console.error("Error listing buckets:", bucketsError);
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  console.log("Target file path:", fileName);
  console.log("Target bucket: product-images");

  const { data: uploadData, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  console.log("Upload result - data:", uploadData);
  console.log("Upload result - error:", error);

  if (error) {
    console.error("=== UPLOAD ERROR DETAILS ===");
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    if (error.message?.includes("policy") || error.message?.includes("permission")) {
      throw new Error("No tenés permiso para subir imágenes. Contactá al administrador.");
    }
    if (error.message?.includes("bucket") || error.message?.includes("not found")) {
      throw new Error(`El bucket 'product-images' no existe o hay un problema. Error: ${error.message}`);
    }
    throw new Error(`Error al subir imagen: ${error.message}`);
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  console.log("Public URL:", data.publicUrl);
  console.log("=== END DEBUG ===");

  return data.publicUrl;
}

export async function deleteOffer(offerId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("offers").delete().eq("id", offerId);

  if (error) {
    console.error("deleteOffer error:", error);
    if (error.code === "42501" || error.message?.includes("policy")) {
      throw new Error("No tenés permiso para eliminar esta oferta");
    }
    throw new Error(`Error al eliminar oferta: ${error.message}`);
  }
}
