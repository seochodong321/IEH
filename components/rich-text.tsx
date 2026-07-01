import { Fragment, type ReactNode } from "react";

// **굵게**, http(s) 링크, 줄바꿈을 지원하는 경량 렌더 (마크다운 라이브러리 없이).
// http(s)만 링크화 → href 안전, 나머지 텍스트/특수문자는 React가 이스케이프.
const URL_RE = /(https?:\/\/[^\s]+)/g;
const BOLD_RE = /\*\*([^*\n]+)\*\*/g;
const TRAIL_RE = /[.,;:!?)\]}]+$/;

function linkify(
  text: string,
  keyPrefix: string,
  disable: boolean,
): ReactNode[] {
  // 카드 프리뷰처럼 <Link>로 감싼 곳에선 <a> 중첩을 피하려고 링크를 끈다.
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

export function RichText({
  text,
  className,
  disableLinks = false,
}: {
  text: string;
  className?: string;
  disableLinks?: boolean;
}) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let k = 0;
  const re = new RegExp(BOLD_RE);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last)
      nodes.push(...linkify(text.slice(last, m.index), `t${k++}`, disableLinks));
    nodes.push(<strong key={`b${k++}`}>{m[1]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length)
    nodes.push(...linkify(text.slice(last), `t${k++}`, disableLinks));

  return <p className={className}>{nodes}</p>;
}
