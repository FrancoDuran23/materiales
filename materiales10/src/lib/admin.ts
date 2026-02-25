import { getSupabase } from "./supabase";
import type { Vendor, Branch, Product } from "./database.types";

// Verificar si el usuario actual es admin
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    console.error("checkIsAdmin error:", error);
    return false;
  }
  return data === true;
}

// ─── Vendors ───

export async function fetchAllVendors(): Promise<Vendor[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("is_active", { ascending: true }) // Pendientes (false) primero
    .order("created_at", { ascending: false }); // Más recientes primero

  if (error) {
    console.error("fetchAllVendors error:", error);
    return [];
  }
  return data ?? [];
}

export async function createVendorByAdmin(data: {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
}): Promise<Vendor> {
  const supabase = getSupabase();
  const { data: result, error } = await supabase
    .from("vendors")
    .insert({
      name: data.name,
      email: data.email?.trim().toLowerCase() || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      owner_id: null, // Se asigna después cuando el vendedor hace login
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateVendor(
  vendorId: string,
  updates: Partial<{
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    is_active: boolean;
    owner_id: string | null;
  }>
): Promise<void> {
  const supabase = getSupabase();

  // Normalizar email si se está actualizando
  const normalizedUpdates = {
    ...updates,
    email: updates.email?.trim().toLowerCase(),
  };

  const { error } = await supabase
    .from("vendors")
    .update(normalizedUpdates)
    .eq("id", vendorId);

  if (error) throw error;
}

export async function deleteVendor(vendorId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("vendors").delete().eq("id", vendorId);
  if (error) throw error;
}

// ─── Branches ───

export async function fetchAllBranches(): Promise<(Branch & { vendor_name: string })[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("branches")
    .select("*, vendor:vendors(name)")
    .order("vendor_id")
    .order("name");

  if (error) {
    console.error("fetchAllBranches error:", error);
    return [];
  }

  return (data ?? []).map((b) => ({
    ...b,
    vendor_name: (b.vendor as { name: string })?.name ?? "",
  }));
}

export async function createBranchByAdmin(data: {
  vendor_id: string;
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
}): Promise<Branch> {
  const supabase = getSupabase();
  const { data: result, error } = await supabase
    .from("branches")
    .insert({
      vendor_id: data.vendor_id,
      name: data.name,
      address: data.address,
      city: data.city,
      province: data.province,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      phone: data.phone ?? null,
      whatsapp: data.whatsapp ?? null,
      free_shipping: data.free_shipping ?? false,
      free_shipping_radius_km: data.free_shipping_radius_km ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateBranch(
  branchId: string,
  updates: Partial<Branch>
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("branches")
    .update(updates)
    .eq("id", branchId);

  if (error) throw error;
}

export async function deleteBranch(branchId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("branches").delete().eq("id", branchId);
  if (error) throw error;
}

// ─── Products ───

export async function fetchAllProducts(): Promise<(Product & { category_name: string })[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("name");

  if (error) {
    console.error("fetchAllProducts error:", error);
    return [];
  }

  return (data ?? []).map((p) => ({
    ...p,
    category_name: (p.category as { name: string })?.name ?? "",
  }));
}

export async function createProduct(data: {
  name: string;
  category_id: string;
  unit: string;
}): Promise<Product> {
  const supabase = getSupabase();
  const { data: result, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      category_id: data.category_id,
      unit: data.unit,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

// Products CRUD

// ─── Categories ───

export async function fetchAllCategories() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("fetchAllCategories error:", error);
    return [];
  }
  return data ?? [];
}

// ─── Validations ───

export async function checkEmailExists(email: string, excludeVendorId?: string): Promise<boolean> {
  const supabase = getSupabase();
  let query = supabase
    .from("vendors")
    .select("id")
    .eq("email", email.trim().toLowerCase());

  if (excludeVendorId) {
    query = query.neq("id", excludeVendorId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error("checkEmailExists error:", error);
    return false;
  }
  return data !== null;
}

// ─── Bulk Branch Operations ───

export async function updateVendorBranchesStatus(vendorId: string, isActive: boolean): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("branches")
    .update({ is_active: isActive })
    .eq("vendor_id", vendorId);

  if (error) throw error;
}

// Obtener sucursales de un vendor específico
export async function fetchVendorBranches(vendorId: string): Promise<Branch[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("is_active", { ascending: false })
    .order("name");

  if (error) {
    console.error("fetchVendorBranches error:", error);
    return [];
  }
  return data ?? [];
}

// Contar sucursales activas de un vendor
export async function countVendorActiveBranches(vendorId: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from("branches")
    .select("id", { count: "exact", head: true })
    .eq("vendor_id", vendorId)
    .eq("is_active", true);

  if (error) {
    console.error("countVendorActiveBranches error:", error);
    return 0;
  }
  return count ?? 0;
}
