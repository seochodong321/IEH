import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RichText } from "@/components/rich-text";
import type { Post } from "@/lib/types";

// 관리자가 올린 게시물을 대시보드 하단 '관련 게시물'로 노출. 카드 클릭 → 게시물 상세.
export function DashboardPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">관련 게시물</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/posts/${p.id}`}
            className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
          >
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" className="h-32 w-full object-cover" />
            ) : null}
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <h3 className="font-semibold break-words">{p.title}</h3>
              {p.content ? (
                <RichText
                  text={p.content}
                  disableLinks
                  className="line-clamp-4 text-sm leading-relaxed break-words whitespace-pre-wrap text-muted-foreground"
                />
              ) : null}
              <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-blue-600">
                자세히 보기 <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
