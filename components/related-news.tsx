import { ExternalLink, Newspaper } from "lucide-react";
import { fetchRelatedNews } from "@/lib/related-news";

function formatPubDate(pubDate: string): string {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
  }).format(d);
}

// 행사 제목 기반 관련 기사 (Google 뉴스). 결과가 없으면 아무것도 렌더하지 않는다.
export async function RelatedNews({ query }: { query: string }) {
  const items = await fetchRelatedNews(query);
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Newspaper className="size-4" />
        관련 기사
      </h2>
      <ul className="divide-y">
        {items.map((n, i) => (
          <li key={`${n.link}-${i}`}>
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 py-2.5 transition-colors hover:bg-muted/50"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium break-words">{n.title}</span>
                <span className="text-xs text-muted-foreground">
                  {[n.source, formatPubDate(n.pubDate)].filter(Boolean).join(" · ")}
                </span>
              </span>
              <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Google 뉴스 검색 기반 · 관련도순 (외부 기사로 이동)
      </p>
    </div>
  );
}
