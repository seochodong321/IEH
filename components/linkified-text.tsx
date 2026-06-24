import { Fragment } from "react";

// 평문 속 http(s) URL을 클릭 가능한 링크로 렌더한다.
// http(s)만 매칭하므로 href가 안전하고(javascript: 등 불가), 나머지 텍스트는 React가 이스케이프.
const URL_RE = /(https?:\/\/[^\s]+)/g;
const TRAIL_RE = /[.,;:!?)\]}]+$/; // URL 끝에 붙은 문장부호는 링크에서 제외

export function LinkifiedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p className={className}>
      {text.split(URL_RE).map((part, i) => {
        if (!/^https?:\/\//.test(part)) return <Fragment key={i}>{part}</Fragment>;
        const trail = part.match(TRAIL_RE)?.[0] ?? "";
        const url = trail ? part.slice(0, -trail.length) : part;
        return (
          <Fragment key={i}>
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
      })}
    </p>
  );
}
