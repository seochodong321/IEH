import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostGrid } from "@/components/post-grid";
import type { Post } from "@/lib/types";

// 관리자가 올린 게시물을 대시보드 '새소식'으로 노출.
export function DashboardPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">새소식</h2>
        <Link
          href="/posts"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          전체 소식 더보기 <ArrowRight className="size-4" />
        </Link>
      </div>
      <PostGrid posts={posts} />
    </section>
  );
}
