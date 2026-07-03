import { describe, expect, it } from "vitest";
import {
  addDays,
  computeStatus,
  formatDateRange,
  getStats,
  monthRange,
  occursInRange,
  occursOn,
  recurrenceLabel,
  weekRange,
} from "@/lib/event-utils";
import type { EventRecord } from "@/lib/types";

// 반복 계산용 최소 이벤트 (2026-07-01은 수요일)
function ev(over: Partial<EventRecord> = {}) {
  return {
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    recurrenceType: "none" as const,
    recurrenceDays: [] as number[],
    ...over,
  };
}

describe("computeStatus", () => {
  it("기준일에 따라 예정/진행중/종료를 판정한다", () => {
    expect(computeStatus("2026-07-10", "2026-07-20", "2026-07-01")).toBe("upcoming");
    expect(computeStatus("2026-07-10", "2026-07-20", "2026-07-15")).toBe("ongoing");
    expect(computeStatus("2026-07-10", "2026-07-20", "2026-07-21")).toBe("ended");
  });

  it("시작일·종료일 당일은 진행중이다 (경계 포함)", () => {
    expect(computeStatus("2026-07-10", "2026-07-20", "2026-07-10")).toBe("ongoing");
    expect(computeStatus("2026-07-10", "2026-07-20", "2026-07-20")).toBe("ongoing");
  });
});

describe("occursOn (반복 패턴)", () => {
  it("연속 행사는 운영 기간 안이면 매일 열린다", () => {
    expect(occursOn(ev(), "2026-07-15")).toBe(true);
    expect(occursOn(ev(), "2026-06-30")).toBe(false);
    expect(occursOn(ev(), "2026-08-01")).toBe(false);
  });

  it("매주 반복은 지정 요일에만 열린다 (3=수)", () => {
    const weekly = ev({ recurrenceType: "weekly", recurrenceDays: [3] });
    expect(occursOn(weekly, "2026-07-01")).toBe(true); // 수
    expect(occursOn(weekly, "2026-07-02")).toBe(false); // 목
    expect(occursOn(weekly, "2026-07-08")).toBe(true); // 다음 주 수
  });
});

describe("occursInRange", () => {
  it("주말 반복 행사는 평일만 있는 구간에서 발생하지 않는다 (6=토)", () => {
    const sat = ev({ recurrenceType: "weekly", recurrenceDays: [6] });
    // 2026-07-06(월) ~ 07-10(금): 토요일 없음
    expect(occursInRange(sat, "2026-07-06", "2026-07-10")).toBe(false);
    // 07-11(토)까지 넓히면 발생
    expect(occursInRange(sat, "2026-07-06", "2026-07-11")).toBe(true);
  });

  it("운영 기간과 구간이 안 겹치면 false", () => {
    expect(occursInRange(ev(), "2026-08-01", "2026-08-31")).toBe(false);
  });
});

describe("주/월 경계", () => {
  it("weekRange는 월요일 시작 한 주를 돌려준다", () => {
    // 2026-07-03은 금요일
    expect(weekRange("2026-07-03")).toEqual({
      start: "2026-06-29",
      end: "2026-07-05",
    });
  });

  it("monthRange는 말일을 정확히 계산한다 (2026년 2월 = 28일)", () => {
    expect(monthRange("2026-02-15")).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
    });
  });

  it("addDays는 연 경계를 넘는다", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("표기", () => {
  it("단일일 행사는 날짜 하나만 표시한다", () => {
    expect(formatDateRange("2026-07-01", "2026-07-01")).toBe("2026.07.01");
    expect(formatDateRange("2026-07-01", "2026-07-03")).toBe(
      "2026.07.01 – 2026.07.03",
    );
  });

  it("recurrenceLabel은 주말/평일/요일 나열을 구분한다", () => {
    const base = { recurrenceType: "weekly" as const };
    expect(recurrenceLabel({ ...base, recurrenceDays: [0, 6] })).toBe("매주 주말");
    expect(recurrenceLabel({ ...base, recurrenceDays: [1, 2, 3, 4, 5] })).toBe(
      "매주 평일",
    );
    expect(recurrenceLabel({ ...base, recurrenceDays: [3, 5] })).toBe("매주 수·금");
    expect(
      recurrenceLabel({ recurrenceType: "none", recurrenceDays: [] }),
    ).toBe("");
  });
});

describe("getStats", () => {
  it("오늘/이번주/이번달/진행중 건수를 집계한다", () => {
    const today = "2026-07-03"; // 금
    const events = [
      ev(), // 7월 내내 → 전부 해당
      ev({ startDate: "2026-07-20", endDate: "2026-07-25" }), // 이달만
      ev({ startDate: "2026-08-01", endDate: "2026-08-05" }), // 해당 없음
    ] as EventRecord[];
    const s = getStats(events, today);
    expect(s.today).toBe(1);
    expect(s.week).toBe(1);
    expect(s.month).toBe(2);
    expect(s.ongoing).toBe(1);
  });
});
