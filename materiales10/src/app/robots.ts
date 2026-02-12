import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/vendor/", "/admin/", "/api/"],
      },
    ],
    sitemap: "https://materiales10.com/sitemap.xml",
  };
}
