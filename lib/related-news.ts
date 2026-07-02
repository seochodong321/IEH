import "server-only";

import { unstable_cache } from "next/cache";

// 행사 제목으로 Google 뉴스 RSS를 검색해 관련 기사를 가져온다.
// 별도 API 키·저장소 없이 동작하며, Next fetch 캐시로 6시간 캐싱한다.

type NewsItem = {
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

const LIMIT = 5;
// 구글이 결과가 적으면 느슨하게 매칭된 기사로 채우므로, 후보를 넉넉히 받아
// 행사명 키워드 필터를 통과한 것만 남긴다.
const CANDIDATES = 12;

// 행사명에서 관련성 판별용 키워드 추출 — 연도·숫자·'인천'처럼
// 아무 기사에나 들어가는 토큰은 제외한다.
function keywords(title: string): string[] {
  return title
    .split(/[^\p{L}\p{N}]+/u)
    .filter(
      (t) =>
        t.length >= 2 && t !== "인천" && !/^\d+(년|월|일|회|주년)?$/.test(t),
    );
}

async function fetchAndParse(query: string): Promise<NewsItem[]> {
  const q = query.trim();
  if (!q) return [];
  // 행사명만으로 검색하면 무관한 기사가 섞인다 → 제목에 '인천'이 없으면
  // 함께 검색해 지역 관련성을 높인다.
  const terms = q.includes("인천") ? q : `${q} 인천`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    terms,
  )}&hl=ko&gl=KR&ceid=KR:ko`;

  let xml: string;
  try {
    // 페이지가 force-dynamic이라 fetch 캐시는 무효 → 아래 unstable_cache로 결과를 캐시한다.
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  const items: NewsItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null && items.length < CANDIDATES) {
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

  // 행사명 키워드가 기사 제목에 하나도 없으면 무관한 기사로 보고 제외
  const keys = keywords(q);
  const relevant = keys.length
    ? items.filter((n) => keys.some((k) => n.title.includes(k)))
    : items;
  return relevant.slice(0, LIMIT);
}

// 결과(제목별)를 6시간 캐시. unstable_cache는 데이터 캐시라 페이지의 force-dynamic과
// 무관하게 동작 → 매 조회마다 Google에 안 때리고, 캐시 미스 때만 fetch가 실행된다.
export const fetchRelatedNews = unstable_cache(fetchAndParse, ["related-news"], {
  revalidate: 21600,
});
