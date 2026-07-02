import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RichText } from "@/components/rich-text";
import { formatDate } from "@/lib/event-utils";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/types";

// 새소식 목록 상단의 큰 피처드(최신 소식) 카드.
// 이미지가 있으면 좌우 분할(매거진), 없으면 텍스트만 컴팩트하게.
export function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className={cn(
        "group grid overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg",
        post.imageUrl && "md:grid-cols-2",
      )}
    >
      {post.imageUrl ? (
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[260px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
            최신 소식
          </span>
          <span className="text-muted-foreground">
            {formatDate(post.createdAt.slice(0, 10))}
          </span>
        </div>
        <h2 className="text-2xl font-bold break-words group-hover:text-primary">
          {post.title}
        </h2>
        {post.content ? (
          <RichText
            text={post.content}
            preview
            className="line-clamp-3 leading-relaxed break-words whitespace-pre-wrap text-muted-foreground"
          />
        ) : null}
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
          자세히 보기
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
