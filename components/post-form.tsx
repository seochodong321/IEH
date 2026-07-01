"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bold } from "lucide-react";
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

const SYMBOLS = ["▶", "★", "※", "·", "✔", "📌", "📅", "📍", "📞"];

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
  const [content, setContent] = useState(post?.content ?? "");
  const [linkUrl, setLinkUrl] = useState(post?.linkUrl ?? "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? "");
  const [fetchingThumb, setFetchingThumb] = useState(false);

  const textarea = () =>
    document.getElementById("post-content") as HTMLTextAreaElement | null;

  // 선택 영역을 기호로 감싸기(굵게). 선택이 없으면 커서 자리에 삽입.
  function surround(before: string, after = before) {
    const el = textarea();
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const sel = content.slice(s, e);
    setContent(content.slice(0, s) + before + sel + after + content.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }

  function insert(str: string) {
    const el = textarea();
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    setContent(content.slice(0, s) + str + content.slice(e));
    const pos = s + str.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  async function loadThumb() {
    const url = linkUrl.trim();
    if (!url) return;
    setFetchingThumb(true);
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      const data = (await res.json()) as { image: string | null };
      if (data.image) {
        setImageUrl(data.image);
        toast.success("링크에서 썸네일을 가져왔어요.");
      } else {
        toast.error("이미지를 찾지 못했어요. 주소를 직접 넣어 주세요.");
      }
    } catch {
      toast.error("불러오기에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setFetchingThumb(false);
    }
  }

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

      <Field label="내용" htmlFor="post-content">
        <div className="mb-1.5 flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => surround("**")}
            title="굵게 (**텍스트**)"
          >
            <Bold className="size-4" />
          </Button>
          <span className="mx-1 h-4 w-px bg-border" />
          {SYMBOLS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => insert(`${s} `)}
              title={`${s} 삽입`}
              className="rounded-md px-2 py-1 text-sm hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
        <Textarea
          id="post-content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          placeholder="**굵게**, 링크(http…)는 자동으로 적용됩니다."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          굵게는 <b>**양쪽 별표**</b>로, 링크는 http로 시작하면 자동으로
          걸립니다. 이모지·특수문자는 그대로 입력하면 됩니다.
        </p>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="링크 (선택)" htmlFor="linkUrl">
          <Input
            id="linkUrl"
            name="linkUrl"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://"
          />
        </Field>

        <Field label="썸네일 이미지 (선택)" htmlFor="imageUrl">
          {imageUrl ? (
            <div className="mb-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="썸네일 미리보기"
                className="h-16 w-24 rounded-md object-cover ring-1 ring-foreground/10"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                제거
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://"
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={fetchingThumb || !linkUrl.trim()}
              onClick={loadThumb}
            >
              {fetchingThumb ? "가져오는 중..." : "링크에서 가져오기"}
            </Button>
          </div>
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
