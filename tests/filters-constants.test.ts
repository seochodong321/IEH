import { describe, expect, it } from "vitest";
import { eventFiltersFromParams } from "@/lib/events-query";
import { asCategory, districtLabel } from "@/lib/constants";

describe("eventFiltersFromParams (쿼리스트링 → 필터)", () => {
  it("유효한 값은 통과, 모르는 값은 버린다", () => {
    const f = eventFiltersFromParams({
      category: "festival",
      district: "없는권역",
      status: "ongoing",
      q: "펜타포트",
    });
    expect(f.category).toBe("festival");
    expect(f.district).toBeUndefined();
    expect(f.status).toBe("ongoing");
    expect(f.query).toBe("펜타포트");
  });

  it("정렬은 허용 목록 밖이면 기본값(start)", () => {
    expect(eventFiltersFromParams({ sort: "created" }).sort).toBe("created");
    expect(eventFiltersFromParams({ sort: "hack" }).sort).toBe("start");
    expect(eventFiltersFromParams({}).sort).toBe("start");
  });

  it("배열로 들어온 파라미터(?q=a&q=b)는 무시한다", () => {
    expect(eventFiltersFromParams({ q: ["a", "b"] }).query).toBeUndefined();
  });

  it("ended·featured 플래그는 '1'일 때만 켜진다", () => {
    expect(eventFiltersFromParams({ ended: "1" }).includeEnded).toBe(true);
    expect(eventFiltersFromParams({ ended: "true" }).includeEnded).toBe(false);
    expect(eventFiltersFromParams({ featured: "1" }).featured).toBe(true);
  });
});

describe("분류값 안전장치 (DB text 컬럼 대비)", () => {
  it("모르는 카테고리는 '기타'로 보정한다", () => {
    expect(asCategory("festival")).toBe("festival");
    expect(asCategory("삭제된분류")).toBe("etc");
  });

  it("모르는 권역은 원본 값을 그대로 표시한다 (크래시 방지)", () => {
    expect(districtLabel("seo")).toBe("서해구");
    expect(districtLabel("과거권역")).toBe("과거권역");
  });
});
