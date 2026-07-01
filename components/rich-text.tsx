import { Fragment, type ReactNode } from "react";
import { linkifyText } from "@/components/linkify";

// **굵게** · http(s) 링크 · ![](url) 이미지 · 줄바꿈을 지원하는 경량 렌더
// (마크다운 라이브러리 없이). 텍스트/특수문자는 React가 이스케이프.
// preview=true(카드 프리뷰)면 <Link> 중첩·큰 이미지를 피하려고 링크·이미지를 끈다.
const BOLD_RE = /\*\*([^*\n]+)\*\*/g;
const IMG_RE = /!\[[^\]]*\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;

// 인라인(굵게 + 링크) 렌더
function inline(text: string, keyBase: string, disableLinks: boolean): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(BOLD_RE)) {
    const idx = m.index ?? 0;
    if (idx > last)
      nodes.push(...linkifyText(text.slice(last, idx), `${keyBase}t${k++}`, disableLinks));
    nodes.push(<strong key={`${keyBase}b${k++}`}>{m[1]}</strong>);
    last = idx + m[0].length;
  }
  if (last < text.length)
    nodes.push(...linkifyText(text.slice(last), `${keyBase}t${k++}`, disableLinks));
  return nodes;
}

export function RichText({
  text,
  className,
  preview = false,
}: {
  text: string;
  className?: string;
  preview?: boolean;
}) {
  // 이미지 토큰 ![](url) 기준으로 블록 분할
  const blocks: { type: "text" | "img"; value: string; key: number }[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(IMG_RE)) {
    const idx = m.index ?? 0;
    if (idx > last)
      blocks.push({ type: "text", value: text.slice(last, idx), key: i++ });
    blocks.push({ type: "img", value: m[1], key: i++ });
    last = idx + m[0].length;
  }
  if (last < text.length)
    blocks.push({ type: "text", value: text.slice(last), key: i++ });

  return (
    <div className={className}>
      {blocks.map((b) =>
        b.type === "img" ? (
          preview ? null : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={b.key}
              src={b.value}
              alt=""
              className="my-2 block max-h-[32rem] w-auto max-w-full rounded-lg object-contain ring-1 ring-foreground/10"
            />
          )
        ) : (
          <Fragment key={b.key}>{inline(b.value, `${b.key}-`, preview)}</Fragment>
        ),
      )}
    </div>
  );
}
