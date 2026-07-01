// 사이트 절대 URL (sitemap·robots·Open Graph·metadataBase 공용).
// 우선순위: NEXT_PUBLIC_SITE_URL(커스텀 도메인 등) → Vercel 운영 도메인 → 로컬.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
