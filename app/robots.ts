import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"], // 관리자·API는 색인 제외
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
