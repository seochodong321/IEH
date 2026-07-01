import { PostGrid } from "@/components/post-grid";
import type { Post } from "@/lib/types";

// 관리자가 올린 게시물을 대시보드 '새소식'으로 노출.
export function DashboardPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">새소식</h2>
      <PostGrid posts={posts} />
    </section>
  );
}
