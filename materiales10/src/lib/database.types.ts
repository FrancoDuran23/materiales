export type StockStatus = "disponible" | "consultar" | "sin_stock";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          category_id: string;
          unit: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      vendors: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          logo_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vendors"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["vendors"]["Insert"]>;
      };
      branches: {
        Row: {
          id: string;
          vendor_id: string;
          name: string;
          address: string;
          city: string;
          province: string;
          lat: number | null;
          lng: number | null;
          phone: string | null;
          whatsapp: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["branches"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["branches"]["Insert"]>;
      };
      offers: {
        Row: {
          id: string;
          branch_id: string;
          product_id: string;
          price: number;
          stock_status: StockStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["offers"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["offers"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          buyer_name: string;
          buyer_phone: string;
          buyer_email: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          offer_id: string;
          quantity: number;
          price_snapshot: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
    };
    Functions: {
      search_offers: {
        Args: {
          q: string;
          buyer_lat: number | null;
          buyer_lng: number | null;
          category_slug: string | null;
          sort_mode: string;
          lim: number;
          off: number;
        };
        Returns: SearchOfferResult[];
      };
    };
  };
}

export interface SearchOfferResult {
  offer_id: string;
  product_name: string;
  product_unit: string;
  product_image_url: string | null;
  category_slug: string;
  price: number;
  stock_status: StockStatus;
  vendor_name: string;
  branch_name: string;
  branch_city: string;
  branch_address: string;
  branch_phone: string | null;
  branch_whatsapp: string | null;
  branch_lat: number | null;
  branch_lng: number | null;
  distance_km: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  unit: string;
  image_url: string | null;
}

export interface Vendor {
  id: string;
  owner_id: string | null;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  is_active: boolean;
}

export interface Branch {
  id: string;
  vendor_id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  whatsapp: string | null;
  is_active: boolean;
}

export interface Offer {
  id: string;
  branch_id: string;
  product_id: string;
  price: number;
  stock_status: StockStatus;
  image_url: string | null;
}

export interface BuyerLocation {
  lat: number;
  lng: number;
  source: "gps" | "manual";
  label?: string;
}
