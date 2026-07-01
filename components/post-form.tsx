"use client";

import {
  useActionState,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
} from "react";
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
  const [uploading, setUploading] = useState(false);

  const textarea = () =>
    document.getElementById("post-content") as HTMLTextAreaElement | null;

  // 선택 영역을 기호로 감싸기(굵게). 선택이 없으면 커서 자리에 삽입.
  // 값은 DOM에서 읽어 stale 클로저를 피한다.
  function surround(before: string, after = before) {
    const el = textarea();
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    setContent(
      value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e),
    );
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, e + before.length);
    });
  }

  function insert(str: string) {
    const el = textarea();
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    setContent(value.slice(0, s) + str + value.slice(e));
    const pos = s + str.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  // 클립보드 이미지를 붙여넣으면 업로드 후 본문에 ![](url) 삽입
  async function onPaste(e: ReactClipboardEvent<HTMLTextAreaElement>) {
    const imgItem = Array.from(e.clipboardData?.items ?? []).find(
      (it) => it.kind === "file" && it.type.startsWith("image/"),
    );
    if (!imgItem) return; // 이미지가 아니면 기본 텍스트 붙여넣기
    e.preventDefault();
    const file = imgItem.getAsFile();
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/images", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        insert(`\n![](${data.url})\n`);
        toast.success("이미지를 본문에 넣었어요.");
      } else {
        toast.error(data.error ?? "이미지 업로드에 실패했어요.");
      }
    } catch {
      toast.error("이미지 업로드에 실패했어요.");
    } finally {
      setUploading(false);
    }
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
          onPaste={onPaste}
          rows={7}
          placeholder="**굵게**, 링크(http…)는 자동으로 적용됩니다. 이미지는 복사해서 붙여넣기(Ctrl/⌘+V)."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          굵게 <b>**별표**</b> · http 링크 자동 · 이모지·특수문자 그대로 ·{" "}
          <b>이미지는 복사해 붙여넣기</b>
          {uploading ? (
            <span className="ml-1 font-medium text-blue-600">
              이미지 업로드 중…
            </span>
          ) : null}
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
        <Button type="submit" disabled={pending || uploading}>
          {pending ? "저장 중..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" render={<Link href="/admin/posts" />}>
          취소
        </Button>
      </div>
    </form>
  );
}
