"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/form-field";
import type { PostFormState } from "@/actions/posts";
import type { Post } from "@/lib/types";

type Action = (
  prev: PostFormState,
  formData: FormData,
) => Promise<PostFormState>;

export function PostForm({
  action,
  post,
  submitLabel,
}: {
  action: Action;
  post?: Partial<Post>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<PostFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <Field label="제목" htmlFor="title" required>
        <Input
          id="title"
          name="title"
          defaultValue={post?.title}
          placeholder="예: 2026 인천 대표 축제 안내"
          required
        />
      </Field>

      <Field label="내용" htmlFor="content">
        <Textarea
          id="content"
          name="content"
          defaultValue={post?.content}
          rows={6}
          placeholder="게시물 내용을 입력하세요. (본문 속 링크는 자동으로 클릭 가능해집니다)"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="링크 (선택)" htmlFor="linkUrl">
          <Input
            id="linkUrl"
            name="linkUrl"
            type="url"
            defaultValue={post?.linkUrl ?? ""}
            placeholder="https://"
          />
        </Field>
        <Field label="이미지 주소 (선택)" htmlFor="imageUrl">
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={post?.imageUrl ?? ""}
            placeholder="https://"
          />
        </Field>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" render={<Link href="/admin/posts" />}>
          취소
        </Button>
      </div>
    </form>
  );
}
