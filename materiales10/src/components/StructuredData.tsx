interface StructuredDataProps {
  type: "Offer" | "Product" | "LocalBusiness" | "WebSite" | "ItemList";
  data: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Helpers for common schemas

export function OfferSchema(offer: {
  product_name: string;
  price: number;
  vendor_name: string;
  branch_address: string;
  branch_city: string;
  branch_province: string;
  stock_status: string;
}) {
  return {
    name: offer.product_name,
    price: offer.price.toString(),
    priceCurrency: "ARS",
    availability:
      offer.stock_status === "disponible"
        ? "https://schema.org/InStock"
        : offer.stock_status === "sin_stock"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/PreOrder",
    seller: {
      "@type": "LocalBusiness",
      name: offer.vendor_name,
      address: {
        "@type": "PostalAddress",
        streetAddress: offer.branch_address,
        addressLocality: offer.branch_city,
        addressRegion: offer.branch_province,
        addressCountry: "AR",
      },
    },
  };
}

export function LocalBusinessSchema(business: {
  name: string;
  address: string;
  city: string;
  province: string;
  phone?: string;
  lat?: number;
  lng?: number;
}) {
  const schema: Record<string, unknown> = {
    name: business.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.province,
      addressCountry: "AR",
    },
  };

  if (business.phone) {
    schema.telephone = business.phone;
  }

  if (business.lat && business.lng) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: business.lat,
      longitude: business.lng,
    };
  }

  return schema;
}

export function WebSiteSchema() {
  return {
    name: "ConstructNOA",
    description: "Comparador de precios de materiales de construcción en Salta y Jujuy",
    url: "https://constructnoa.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://constructnoa.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function ItemListSchema(items: Array<{ name: string; url: string; position: number }>) {
  return {
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}
