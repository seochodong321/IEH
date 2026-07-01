import { Fragment, type ReactNode } from "react";

// **굵게** · http(s) 링크 · ![](url) 이미지 · 줄바꿈을 지원하는 경량 렌더
// (마크다운 라이브러리 없이). 텍스트/특수문자는 React가 이스케이프.
// preview=true(카드 프리뷰)면 <Link> 중첩·큰 이미지를 피하려고 링크·이미지를 끈다.
const URL_RE = /(https?:\/\/[^\s]+)/g;
const BOLD_RE = /\*\*([^*\n]+)\*\*/g;
const IMG_RE = /!\[[^\]]*\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
const TRAIL_RE = /[.,;:!?)\]}]+$/;

function linkify(text: string, keyPrefix: string, disable: boolean): ReactNode[] {
  if (disable) return [<Fragment key={keyPrefix}>{text}</Fragment>];
  return text.split(URL_RE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!/^https?:\/\//.test(part)) return <Fragment key={key}>{part}</Fragment>;
    const trail = part.match(TRAIL_RE)?.[0] ?? "";
    const url = trail ? part.slice(0, -trail.length) : part;
    return (
      <Fragment key={key}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium break-all text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          {url}
        </a>
        {trail}
      </Fragment>
    );
  });
}

// 인라인(굵게 + 링크) 렌더
function inline(text: string, keyBase: string, disableLinks: boolean): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let k = 0;
  const re = new RegExp(BOLD_RE);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last)
      nodes.push(...linkify(text.slice(last, m.index), `${keyBase}t${k++}`, disableLinks));
    nodes.push(<strong key={`${keyBase}b${k++}`}>{m[1]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length)
    nodes.push(...linkify(text.slice(last), `${keyBase}t${k++}`, disableLinks));
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
  const re = new RegExp(IMG_RE);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last)
      blocks.push({ type: "text", value: text.slice(last, m.index), key: i++ });
    blocks.push({ type: "img", value: m[1], key: i++ });
    last = re.lastIndex;
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
