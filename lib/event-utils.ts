// 날짜·상태 관련 순수 유틸. 날짜는 모두 "YYYY-MM-DD" 문자열로 다뤄
// 타임존 문제를 피한다(같은 포맷이면 문자열 비교 = 시간순 비교).

import { WEEKDAYS_KO } from "@/lib/constants";
import type { EventRecord, EventStatus, EventSummary } from "@/lib/types";

// 날짜/반복 계산에 필요한 최소 필드 (EventRecord·EventSummary 모두 충족)
type Occurrable = Pick<
  EventRecord,
  "startDate" | "endDate" | "recurrenceType" | "recurrenceDays"
>;

/** 인천(Asia/Seoul) 기준 오늘 날짜를 YYYY-MM-DD로 반환 */
export function todayKST(): string {
  // en-CA 로케일은 YYYY-MM-DD 형식을 만든다.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

/** 시작/종료일과 기준일(오늘)로 행사 상태를 계산 */
export function computeStatus(
  startDate: string,
  endDate: string,
  today: string = todayKST(),
): EventStatus {
  if (today < startDate) return "upcoming";
  if (today > endDate) return "ended";
  return "ongoing";
}

/** 상태 정렬 우선순위: 진행중 → 예정 → 종료 */
const STATUS_RANK: Record<EventStatus, number> = {
  ongoing: 0,
  upcoming: 1,
  ended: 2,
};

/** 상태순 비교자. 같은 상태면 시작일 → 제목순 */
export function compareByStatus(
  a: EventRecord,
  b: EventRecord,
  today: string = todayKST(),
): number {
  return (
    STATUS_RANK[computeStatus(a.startDate, a.endDate, today)] -
      STATUS_RANK[computeStatus(b.startDate, b.endDate, today)] ||
    a.startDate.localeCompare(b.startDate) ||
    a.title.localeCompare(b.title)
  );
}

/** 날짜 문자열의 요일 (0=일 ... 6=토). UTC 기준으로 계산해 TZ 영향 제거 */
function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** 특정 날짜에 행사가 실제로 열리는지 (반복 패턴 고려) */
export function occursOn(event: Occurrable, date: string): boolean {
  if (date < event.startDate || date > event.endDate) return false;
  if (event.recurrenceType === "weekly") {
    return event.recurrenceDays.includes(weekdayOf(date));
  }
  return true;
}

/** [from, to] 구간 안에 행사 발생일이 하나라도 있는지 (반복 패턴 고려) */
export function occursInRange(
  event: Occurrable,
  from: string,
  to: string,
): boolean {
  const start = event.startDate > from ? event.startDate : from;
  const end = event.endDate < to ? event.endDate : to;
  if (start > end) return false; // 운영 기간이 구간과 안 겹침
  if (event.recurrenceType !== "weekly") return true; // 연속이면 겹치면 발생
  // 매주 반복: 겹치는 구간(최대 수십 일)을 훑어 해당 요일이 있는지 확인
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    if (event.recurrenceDays.includes(cursor.getUTCDay())) return true;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return false;
}

/** 반복 표기 라벨. 연속이면 빈 문자열 */
export function recurrenceLabel(
  event: Pick<EventRecord, "recurrenceType" | "recurrenceDays">,
): string {
  if (event.recurrenceType !== "weekly" || event.recurrenceDays.length === 0) {
    return "";
  }
  const days = [...event.recurrenceDays].sort((a, b) => a - b);
  const set = new Set(days);
  if (days.length === 2 && set.has(0) && set.has(6)) return "매주 주말";
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d)))
    return "매주 평일";
  return `매주 ${days.map((d) => WEEKDAYS_KO[d]).join("·")}`;
}

/** "2026-06-10" → "2026.06.10" */
export function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}

/** 기간 표기. 시작=종료면 단일 날짜만 표시 */
export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

// ---- 기간(주/월) 경계 계산: UTC 메서드만 사용해 타임존 영향 제거 ----

function toUTC(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = toUTC(date);
  d.setUTCDate(d.getUTCDate() + days);
  return ymd(d);
}

/** 월요일 시작 기준 이번 주 [시작, 종료] */
export function weekRange(today: string = todayKST()): {
  start: string;
  end: string;
} {
  const dow = toUTC(today).getUTCDay(); // 0=일 ... 6=토
  const sinceMonday = (dow + 6) % 7;
  const start = addDays(today, -sinceMonday);
  return { start, end: addDays(start, 6) };
}

/** 이번 달 [시작, 종료] */
export function monthRange(today: string = todayKST()): {
  start: string;
  end: string;
} {
  const [y, m] = today.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    start: `${y}-${pad(m)}-01`,
    end: `${y}-${pad(m)}-${pad(lastDay)}`,
  };
}

/** 전체 행사 레코드 → 클라이언트 전송용 경량 모델 (불필요한 필드 제거) */
export function toEventSummary(e: EventRecord): EventSummary {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    district: e.district,
    venue: e.venue,
    startDate: e.startDate,
    endDate: e.endDate,
    recurrenceType: e.recurrenceType,
    recurrenceDays: e.recurrenceDays,
  };
}

/** 대시보드 통계 카드 4종 */
export function getStats(events: EventRecord[], today: string = todayKST()) {
  const week = weekRange(today);
  const month = monthRange(today);
  let todayCount = 0;
  let weekCount = 0;
  let monthCount = 0;
  let ongoingCount = 0;
  for (const e of events) {
    if (occursOn(e, today)) todayCount++;
    if (occursInRange(e, week.start, week.end)) weekCount++;
    if (occursInRange(e, month.start, month.end)) monthCount++;
    if (computeStatus(e.startDate, e.endDate, today) === "ongoing")
      ongoingCount++;
  }
  return { today: todayCount, week: weekCount, month: monthCount, ongoing: ongoingCount };
}
