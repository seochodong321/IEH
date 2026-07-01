import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RichText } from "@/components/rich-text";
import type { Post } from "@/lib/types";

// 게시물 카드 그리드 (대시보드 '새소식' + /posts 목록 공용). 카드 클릭 → 상세.
export function PostGrid({ posts }: { posts: Post[] }) {
  return (
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
                preview
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
  );
}
