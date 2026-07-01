// 사이트 절대 URL (sitemap·robots·Open Graph·metadataBase 공용).
// 우선순위: NEXT_PUBLIC_SITE_URL(커스텀 도메인 등) → Vercel 운영 도메인 → 로컬.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    // 스킴 없이 도메인만 넣어도 안전하게 (new URL(...) 크래시 방지)
    const withScheme = /^https?:\/\//.test(explicit)
      ? explicit
      : `https://${explicit}`;
    return withScheme.replace(/\/+$/, "");
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
