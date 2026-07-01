import Link from "next/link";
import { ArrowLeft, FileText, Pencil, Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getPosts } from "@/lib/data/posts";
import { DeletePostButton } from "@/components/delete-post-button";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/event-utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  await requireAuth();
  const posts = await getPosts();

  return (
    <div className="space-y-5">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        행사 관리로
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">게시물 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            대시보드 하단 “관련 게시물”에 노출됩니다 · 총 {posts.length}건
          </p>
        </div>
        <Link href="/admin/posts/new" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="size-4" />새 게시물
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <FileText className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            등록된 게시물이 없습니다. “새 게시물”로 첫 게시물을 올리세요.
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-xl bg-card ring-1 ring-foreground/10">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.createdAt.slice(0, 10))}
                  {p.linkUrl ? " · 링크" : ""}
                  {p.imageUrl ? " · 이미지" : ""}
                </p>
              </div>
              <Link
                href={`/admin/posts/${p.id}/edit`}
                aria-label="수정"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-8 text-muted-foreground hover:text-foreground",
                )}
              >
                <Pencil className="size-4" />
              </Link>
              <DeletePostButton id={p.id} title={p.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
