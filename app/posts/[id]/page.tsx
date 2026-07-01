import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getPostById } from "@/lib/data/posts";
import { RichText } from "@/components/rich-text";
import { ImageLightbox } from "@/components/image-lightbox";
import { formatDate } from "@/lib/event-utils";

export const dynamic = "force-dynamic";

function snippet(content: string): string {
  return content.replace(/\*\*/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: "게시물을 찾을 수 없습니다" };
  const description = snippet(post.content) || post.title;
  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/posts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        새소식으로
      </Link>

      <article className="space-y-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div>
          <h1 className="text-2xl font-semibold break-words">{post.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(post.createdAt.slice(0, 10))}
          </p>
        </div>

        {post.imageUrl ? (
          <ImageLightbox src={post.imageUrl} alt={post.title} />
        ) : null}

        {post.content ? (
          <RichText
            text={post.content}
            className="leading-relaxed break-words whitespace-pre-wrap"
          />
        ) : null}

        {post.linkUrl ? (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-foreground/10 transition-colors hover:bg-muted"
          >
            <ExternalLink className="size-4" />
            링크 바로가기
          </a>
        ) : null}
      </article>
    </div>
  );
}
