import { Fragment, type ReactNode } from "react";

// 평문 속 http(s) URL을 클릭 가능한 링크로. rich-text / linkified-text 공용.
// http(s)만 매칭 → href 안전, 나머지 텍스트는 React가 이스케이프.
const URL_RE = /(https?:\/\/[^\s]+)/g;

// URL 뒤에 붙은 문장부호를 링크에서 떼어낸다. 단 닫는 괄호 ')'는 URL 안에
// 여는 '(' 가 없을 때만 떼어낸다(예: wikipedia .../Foo_(bar) 는 보존).
function splitTrailingPunct(raw: string): [string, string] {
  let url = raw;
  let trail = "";
  const m = url.match(/[.,;:!?]+$/);
  if (m) {
    trail = m[0];
    url = url.slice(0, -trail.length);
  }
  while (url.endsWith(")") && !url.includes("(")) {
    trail = `)${trail}`;
    url = url.slice(0, -1);
  }
  return [url, trail];
}

export function linkifyText(
  text: string,
  keyPrefix: string,
  disable = false,
): ReactNode[] {
  if (disable) return [<Fragment key={keyPrefix}>{text}</Fragment>];
  return text.split(URL_RE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!/^https?:\/\//.test(part)) return <Fragment key={key}>{part}</Fragment>;
    const [url, trail] = splitTrailingPunct(part);
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
