import { ExternalLink } from "lucide-react";
import { LinkifiedText } from "@/components/linkified-text";
import type { Post } from "@/lib/types";

// 관리자가 올린 게시물을 대시보드 하단 '관련 게시물'로 노출.
export function DashboardPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">관련 게시물</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.id}
            className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
          >
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" className="h-32 w-full object-cover" />
            ) : null}
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <h3 className="font-semibold break-words">{p.title}</h3>
              {p.content ? (
                <LinkifiedText
                  text={p.content}
                  className="line-clamp-4 text-sm leading-relaxed break-words whitespace-pre-wrap text-muted-foreground"
                />
              ) : null}
              {p.linkUrl ? (
                <a
                  href={p.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  자세히 보기 <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
