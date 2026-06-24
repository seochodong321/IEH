import { isAuthenticated } from "@/lib/auth";
import { findDuplicateEvents } from "@/lib/data/events";

export const dynamic = "force-dynamic";

// 같은 제목·시작일의 행사가 있는지 확인 (등록 폼의 중복 경고용). 관리자 전용.
export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(req.url);
  const title = url.searchParams.get("title") ?? "";
  const startDate = url.searchParams.get("startDate") ?? "";
  const excludeId = url.searchParams.get("excludeId") ?? undefined;
  const matches = await findDuplicateEvents(title, startDate, excludeId);
  return Response.json({
    matches: matches.map((e) => ({
      id: e.id,
      title: e.title,
      startDate: e.startDate,
    })),
  });
}
