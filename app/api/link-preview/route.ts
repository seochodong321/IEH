import { isAuthenticated } from "@/lib/auth";
import { fetchLinkImage } from "@/lib/link-image";

export const dynamic = "force-dynamic";

// 홈페이지 URL의 대표 이미지를 찾아 반환 (행사 등록 폼에서 미리보기로 사용).
// 서버가 임의 URL을 가져오므로 관리자 전용 + lib/link-image의 SSRF 가드로 보호.
export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(req.url).searchParams.get("url") ?? "";
  const image = await fetchLinkImage(url);
  return Response.json({ image });
}
