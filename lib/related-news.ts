import "server-only";

// 행사 제목으로 Google 뉴스 RSS를 검색해 관련 기사를 가져온다.
// 별도 API 키·저장소 없이 동작하며, Next fetch 캐시로 6시간 캐싱한다.

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
};

function unwrap(raw: string): string {
  return raw
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

function decode(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function pick(block: string, re: RegExp): string | undefined {
  const m = block.match(re);
  return m ? decode(unwrap(m[1])) : undefined;
}

export async function fetchRelatedNews(
  query: string,
  limit = 5,
): Promise<NewsItem[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    q,
  )}&hl=ko&gl=KR&ceid=KR:ko`;

  let xml: string;
  try {
    const res = await fetch(url, {
      next: { revalidate: 21600 }, // 6시간 캐시 (매 조회마다 안 때리게)
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  const items: NewsItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null && items.length < limit) {
    const block = m[1];
    const title = pick(block, /<title>([\s\S]*?)<\/title>/);
    const link = pick(block, /<link>([\s\S]*?)<\/link>/);
    if (!title || !link) continue;
    const source = pick(block, /<source[^>]*>([\s\S]*?)<\/source>/) ?? "";
    const pubDate = pick(block, /<pubDate>([\s\S]*?)<\/pubDate>/) ?? "";
    // Google 뉴스 제목은 "제목 - 언론사" 형식이 많음 → 언론사 꼬리 제거
    const clean =
      source && title.endsWith(` - ${source}`)
        ? title.slice(0, -(source.length + 3))
        : title;
    items.push({ title: clean, link, source, pubDate });
  }
  return items;
}
