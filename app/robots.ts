import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/rooms", "/booking-lookup"],
        disallow: ["/admin", "/admin/", "/booking-success"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
