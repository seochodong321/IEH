import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getPostById } from "@/lib/data/posts";
import { updatePostAction } from "@/actions/posts";
import { PostForm } from "@/components/post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const action = updatePostAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        게시물 관리로
      </Link>
      <h1 className="text-2xl font-semibold">게시물 수정</h1>
      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <PostForm action={action} post={post} submitLabel="수정하기" />
      </div>
    </div>
  );
}
