import { CATEGORY_MAP, DISTRICT_MAP, STATUS_MAP } from "@/lib/constants";
import type { Category, District, EventFilters, EventStatus } from "@/lib/types";

type SearchParams = Record<string, string | string[] | undefined>;

/** /events 페이지와 CSV 내보내기가 공유하는 쿼리스트링 → 필터 파싱 */
export function eventFiltersFromParams(sp: SearchParams): EventFilters {
  const str = (k: string) =>
    typeof sp[k] === "string" ? (sp[k] as string) : undefined;
  const rawCategory = str("category");
  const rawStatus = str("status");
  const rawDistrict = str("district");
  const rawSort = str("sort");
  return {
    query: str("q"),
    category:
      rawCategory && rawCategory in CATEGORY_MAP
        ? (rawCategory as Category)
        : undefined,
    status:
      rawStatus && rawStatus in STATUS_MAP ? (rawStatus as EventStatus) : undefined,
    district:
      rawDistrict && rawDistrict in DISTRICT_MAP
        ? (rawDistrict as District)
        : undefined,
    from: str("from"),
    to: str("to"),
    sort: rawSort === "created" || rawSort === "status" ? rawSort : "start",
    includeEnded: str("ended") === "1",
    featured: str("featured") === "1",
  };
}
