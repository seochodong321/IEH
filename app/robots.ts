import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // 공개 이미지(/api/images/[id])는 OG·이미지 검색용으로 허용, 그 외 /api·/admin은 제외
      allow: ["/", "/api/images/"],
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
