import { getSupabase } from "./supabase";

export interface CreateOrderParams {
  buyerName: string;
  buyerPhone: string;
  notes?: string;
  items: Array<{
    offerId: string;
    quantity: number;
    priceSnapshot: number;
  }>;
}

export async function createOrder(params: CreateOrderParams): Promise<string> {
  const supabase = getSupabase();

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_name: params.buyerName,
      buyer_phone: params.buyerPhone,
      notes: params.notes ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Error creating order");
  }

  // Create order items
  const items = params.items.map((item) => ({
    order_id: order.id,
    offer_id: item.offerId,
    quantity: item.quantity,
    price_snapshot: item.priceSnapshot,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(items);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return order.id;
}
