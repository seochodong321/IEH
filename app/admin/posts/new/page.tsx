import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { createPostAction } from "@/actions/posts";
import { PostForm } from "@/components/post-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireAuth();
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        게시물 관리로
      </Link>
      <h1 className="text-2xl font-semibold">새 게시물</h1>
      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <PostForm action={createPostAction} submitLabel="등록하기" />
      </div>
    </div>
  );
}
