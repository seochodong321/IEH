import { Newspaper } from "lucide-react";
import { getPosts } from "@/lib/data/posts";
import { PostGrid } from "@/components/post-grid";
import { FeaturedPost } from "@/components/featured-post";

export const dynamic = "force-dynamic";

export const metadata = { title: "새소식" };

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="border-b pb-5">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
          <Newspaper className="size-4" />
          NEWS
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">새소식</h1>
        <p className="mt-1.5 text-muted-foreground">
          인천의 행사·축제 소식과 안내를 전해드립니다.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-16 text-center ring-1 ring-foreground/10">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Newspaper className="size-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            아직 등록된 소식이 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <FeaturedPost post={posts[0]} />
          {posts.length > 1 ? <PostGrid posts={posts.slice(1)} /> : null}
        </div>
      )}
    </div>
  );
}
