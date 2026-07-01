import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { RichText } from "@/components/rich-text";
import { formatDate } from "@/lib/event-utils";
import type { Post } from "@/lib/types";

// 게시물 카드 그리드 (대시보드 '새소식' + /posts 목록 공용). 카드 클릭 → 상세.
export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <Link
          key={p.id}
          href={`/posts/${p.id}`}
          className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt="" className="h-36 w-full object-cover" />
          ) : (
            <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
              <Newspaper className="size-10 text-white/50" />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <h3 className="font-semibold break-words group-hover:text-primary">
              {p.title}
            </h3>
            {p.content ? (
              <RichText
                text={p.content}
                preview
                className="line-clamp-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-muted-foreground"
              />
            ) : null}
            <div className="mt-auto flex items-center justify-between pt-1.5">
              <span className="text-xs text-muted-foreground">
                {formatDate(p.createdAt.slice(0, 10))}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                자세히
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
