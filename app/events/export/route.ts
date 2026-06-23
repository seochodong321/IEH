import { getEvents } from "@/lib/data/events";
import { eventFiltersFromParams } from "@/lib/events-query";
import { toCsv } from "@/lib/csv";
import {
  CATEGORY_MAP,
  INDOOR_OUTDOOR_MAP,
  ORG_TYPE_MAP,
  STATUS_MAP,
  districtLabel,
} from "@/lib/constants";
import { computeStatus, recurrenceLabel, todayKST } from "@/lib/event-utils";

export const dynamic = "force-dynamic";

// 현재 필터된 행사 목록을 CSV로 내려준다 (직원 업무용 — 보고·공유에 엑셀로 사용).
export async function GET(req: Request) {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const events = await getEvents(eventFiltersFromParams(sp));
  const today = todayKST();

  const headers = [
    "행사명",
    "행사유형",
    "시작일",
    "종료일",
    "시간",
    "장소",
    "권역",
    "주최구분",
    "주최",
    "주관",
    "실내외",
    "상태",
    "반복",
    "좋아요",
  ];
  const rows = events.map((e) => [
    e.title,
    CATEGORY_MAP[e.category]?.label ?? e.category,
    e.startDate,
    e.endDate,
    e.startTime ? `${e.startTime}${e.endTime ? `~${e.endTime}` : ""}` : "",
    e.venue,
    districtLabel(e.district),
    ORG_TYPE_MAP[e.orgType]?.label ?? e.orgType,
    e.organizer,
    e.host,
    INDOOR_OUTDOOR_MAP[e.indoorOutdoor]?.label ?? e.indoorOutdoor,
    STATUS_MAP[computeStatus(e.startDate, e.endDate, today)].label,
    recurrenceLabel(e) || "기간 내내",
    String(e.likes),
  ]);

  return new Response(toCsv(headers, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="events-${today}.csv"`,
    },
  });
}
