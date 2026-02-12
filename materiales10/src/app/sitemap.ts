import { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://materiales10.com";
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vendor`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic pages - offers
  try {
    const supabase = getSupabase();
    const { data: offers } = await supabase
      .from("offers")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1000);

    const offerPages: MetadataRoute.Sitemap =
      offers?.map((offer) => ({
        url: `${baseUrl}/offer/${offer.id}`,
        lastModified: new Date(offer.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })) ?? [];

    return [...staticPages, ...offerPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
