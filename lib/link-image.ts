import "server-only";

// 주어진 홈페이지 URL에서 대표 이미지(og:image → twitter:image → 아이콘/로고)를 찾아
// 절대 URL로 반환한다. 사용자가 준 URL을 서버가 가져오므로 SSRF를 완화한다:
// http(s)만 허용 + 사설/내부 대역 차단 + 관리자 전용 라우트에서만 호출.

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "::1" || h === "0.0.0.0") return true;
  if (/^(127|10|0)\./.test(h)) return true; // loopback / 사설 / 0.x
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true; // 링크로컬(클라우드 메타데이터 포함)
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

function isHttp(u: URL): boolean {
  return u.protocol === "http:" || u.protocol === "https:";
}

export async function fetchLinkImage(rawUrl: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (!isHttp(url) || isBlockedHost(url.hostname)) return null;

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; IncheonEventRadar/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    if (!(res.headers.get("content-type") ?? "").includes("text/html")) return null;
    html = (await res.text()).slice(0, 500_000); // 과도한 본문 차단
  } catch {
    return null;
  }

  const grab = (re: RegExp): string | undefined => html.match(re)?.[1];
  const candidate =
    grab(
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    ) ||
    grab(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
    grab(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
    grab(
      /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
    ) ||
    grab(/<link[^>]+rel=["'][^"']*\bicon\b[^"']*["'][^>]+href=["']([^"']+)["']/i);
  if (!candidate) return null;

  try {
    const abs = new URL(candidate, url);
    return isHttp(abs) ? abs.toString() : null;
  } catch {
    return null;
  }
}
