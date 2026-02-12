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

export async function uploadProductImage(file: File): Promise<string> {
  console.log("=== DEBUG uploadProductImage (Admin) ===");
  console.log("File name:", file.name);
  console.log("File size:", file.size, "bytes");
  console.log("File type:", file.type);

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
    console.error("Full error:", JSON.stringify(error, null, 2));

    if (error.message?.includes("bucket") || error.message?.includes("not found")) {
      throw new Error(`El bucket 'product-images' no existe o hay un problema. Error: ${error.message}`);
    }
    throw error;
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  console.log("Public URL:", data.publicUrl);
  console.log("=== END DEBUG ===");

  return data.publicUrl;
}

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
