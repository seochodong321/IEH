// 카테고리·권역·상태·실내외 등 분류값을 한 곳에서 정의한다.
// 필터, 뱃지, 폼 옵션이 모두 이 정의를 재사용한다.
// 색상은 Tailwind 클래스를 "전체 문자열"로 적어 두어야 빌드 시 누락되지 않는다.

import type {
  Category,
  District,
  EventStatus,
  IndoorOutdoor,
  OrgType,
  RecurrenceType,
} from "@/lib/types";

// 요일 라벨 (0=일 ... 6=토)
export const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "기간 내내 (연속)" },
  { value: "weekly", label: "매주 특정 요일 반복" },
];

export interface Option<T extends string> {
  value: T;
  label: string;
  /** 뱃지/칩 배경+글자 색 (색이 필요한 분류에만) */
  badgeClass?: string;
  /** 캘린더 점/막대 색 (색이 필요한 분류에만) */
  dotClass?: string;
}

export const CATEGORIES: Option<Category>[] = [
  {
    value: "festival",
    label: "축제",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
  },
  {
    value: "performance",
    label: "공연",
    badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
    dotClass: "bg-violet-500",
  },
  {
    value: "exhibition",
    label: "전시",
    badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
    dotClass: "bg-cyan-500",
  },
  {
    value: "expo",
    label: "박람회",
    badgeClass: "bg-sky-100 text-sky-700 border-sky-200",
    dotClass: "bg-sky-500",
  },
  {
    value: "sports",
    label: "체육",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  {
    value: "education",
    label: "교육",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },
  {
    value: "etc",
    label: "기타",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-500",
  },
];

// 인천 2군 9구 (2026년 7월 행정체제 개편 기준)
export const DISTRICTS: Option<District>[] = [
  // 9구
  { value: "jemulpo", label: "제물포구" },
  { value: "yeongjong", label: "영종구" },
  { value: "michuhol", label: "미추홀구" },
  { value: "yeonsu", label: "연수구" },
  { value: "namdong", label: "남동구" },
  { value: "bupyeong", label: "부평구" },
  { value: "gyeyang", label: "계양구" },
  { value: "seo", label: "서해구" },
  { value: "geomdan", label: "검단구" },
  // 2군
  { value: "ganghwa", label: "강화군" },
  { value: "ongjin", label: "옹진군" },
];

export const STATUSES: Option<EventStatus>[] = [
  {
    value: "upcoming",
    label: "예정",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  {
    value: "ongoing",
    label: "진행중",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    dotClass: "bg-green-500",
  },
  {
    value: "ended",
    label: "종료",
    badgeClass: "bg-neutral-100 text-neutral-500 border-neutral-200",
    dotClass: "bg-neutral-400",
  },
];

export const INDOOR_OUTDOOR: Option<IndoorOutdoor>[] = [
  { value: "indoor", label: "실내" },
  { value: "outdoor", label: "실외" },
  { value: "mixed", label: "혼합" },
];

export const ORG_TYPES: Option<OrgType>[] = [
  {
    value: "public",
    label: "공공",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  {
    value: "private",
    label: "민간",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-500",
  },
  {
    value: "ppp",
    label: "민관",
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
    dotClass: "bg-teal-500",
  },
];

// value → Option 빠른 조회용 맵
function toMap<T extends string>(options: Option<T>[]): Record<T, Option<T>> {
  return Object.fromEntries(options.map((o) => [o.value, o])) as Record<
    T,
    Option<T>
  >;
}

export const CATEGORY_MAP = toMap(CATEGORIES);
export const DISTRICT_MAP = toMap(DISTRICTS);
export const STATUS_MAP = toMap(STATUSES);
export const INDOOR_OUTDOOR_MAP = toMap(INDOOR_OUTDOOR);
export const ORG_TYPE_MAP = toMap(ORG_TYPES);

// category·district는 DB에서 text라 매핑에 없는 값이 들어올 수 있다(코드에서 분류 제거,
// 수동 DB 수정 등). 아래 헬퍼로 렌더 시 크래시를 막는다.

/** 알 수 없는 카테고리는 'etc'(기타)로 보정 */
export function asCategory(value: string): Category {
  return value in CATEGORY_MAP ? (value as Category) : "etc";
}

/** 권역 라벨 — 매핑에 없으면 원본 값을 그대로 표시(크래시 방지) */
export function districtLabel(value: string): string {
  return DISTRICT_MAP[value as District]?.label ?? value;
}

// 라벨만 필요한 곳(예: Select items 맵)을 위한 헬퍼
export function labelRecord<T extends string>(
  options: Option<T>[],
): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}
