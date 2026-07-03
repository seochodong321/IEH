"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  POSTS_TAG,
  createPost,
  deletePost,
  getPostById,
  updatePost,
} from "@/lib/data/posts";
import { deleteImage } from "@/lib/data/images";
import type { PostInput } from "@/lib/types";

// 본문에 붙여넣기한 업로드 이미지 URL(/api/images/{uuid})에서 id만 추출
const IMG_ID_RE = /\/api\/images\/([0-9a-f-]{36})/gi;
function uploadedImageIds(content: string): string[] {
  return [...content.matchAll(IMG_ID_RE)].map((m) => m[1]);
}

export type PostFormState = { error?: string };

const URL_RE = /^https?:\/\/\S+$/;

function parsePost(formData: FormData): PostInput | string {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const title = get("title");
  const linkUrl = get("linkUrl");
  const imageUrl = get("imageUrl");

  if (!title) return "제목을 입력하세요.";
  if (linkUrl && !URL_RE.test(linkUrl))
    return "링크는 http(s)로 시작하는 주소여야 합니다.";
  if (imageUrl && !URL_RE.test(imageUrl))
    return "이미지 주소는 http(s)로 시작하는 주소여야 합니다.";

  return {
    title,
    content: get("content"),
    linkUrl: linkUrl || null,
    imageUrl: imageUrl || null,
  };
}

function revalidate() {
  updateTag(POSTS_TAG); // 공개 목록 캐시(loadPosts) 즉시 만료 → 바로 최신 반영
  revalidatePath("/"); // 대시보드 '새소식'
  revalidatePath("/posts");
  revalidatePath("/admin/posts");
}

export async function createPostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAuth();
  const parsed = parsePost(formData);
  if (typeof parsed === "string") return { error: parsed };
  await createPost(parsed);
  revalidate();
  redirect("/admin/posts");
}

export async function updatePostAction(
  id: string,
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAuth();
  const parsed = parsePost(formData);
  if (typeof parsed === "string") return { error: parsed };
  const updated = await updatePost(id, parsed);
  if (!updated) return { error: "게시물을 찾을 수 없습니다." };
  revalidate();
  redirect("/admin/posts");
}

export async function deletePostAction(id: string): Promise<{ error?: string }> {
  await requireAuth();
  const post = await getPostById(id);
  const ok = await deletePost(id);
  if (!ok) return { error: "게시물을 찾을 수 없습니다." };
  // 본문에 붙여넣기한 업로드 이미지 정리 (고아 행 방지)
  if (post) {
    for (const imgId of uploadedImageIds(post.content)) await deleteImage(imgId);
  }
  revalidate();
  return {};
}
