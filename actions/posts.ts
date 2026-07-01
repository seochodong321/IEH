"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createPost, deletePost, updatePost } from "@/lib/data/posts";
import type { PostInput } from "@/lib/types";

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
  revalidatePath("/"); // 대시보드 '관련 게시물'
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
  const ok = await deletePost(id);
  if (!ok) return { error: "게시물을 찾을 수 없습니다." };
  revalidate();
  return {};
}
