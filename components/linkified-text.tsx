import { linkifyText } from "@/components/linkify";

// 평문 속 http(s) URL을 클릭 가능한 링크로 렌더 (줄바꿈은 className의 whitespace-pre-wrap).
export function LinkifiedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <p className={className}>{linkifyText(text, "l")}</p>;
}
