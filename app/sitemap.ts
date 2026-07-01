import type { MetadataRoute } from "next";
import { getAllEvents } from "@/lib/data/events";
import { getPosts } from "@/lib/data/posts";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

// 게시된 행사 상세 + 공개 정적 페이지를 사이트맵에 노출 (검색 색인용). /admin 제외.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticPaths = ["", "/events", "/calendar", "/map", "/stats", "/report"];
  const staticEntries = staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const [events, posts] = await Promise.all([getAllEvents(), getPosts()]);
  const eventEntries = events.map((e) => ({
    url: `${base}/events/${e.id}`,
    lastModified: new Date(e.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const postEntries = posts.map((p) => ({
    url: `${base}/posts/${p.id}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...eventEntries, ...postEntries];
}
