import { Newspaper } from "lucide-react";
import { getPosts } from "@/lib/data/posts";
import { PostGrid } from "@/components/post-grid";

export const dynamic = "force-dynamic";

export const metadata = { title: "새소식" };

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">새소식</h1>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <Newspaper className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            등록된 소식이 없습니다.
          </p>
        </div>
      ) : (
        <PostGrid posts={posts} />
      )}
    </div>
  );
}
