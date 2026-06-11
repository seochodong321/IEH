// 도메인 타입 정의 — DB 구현(Drizzle)과 무관하게 앱 전체에서 공유하는 행사 모델

export type Category =
  | "festival"
  | "performance"
  | "expo"
  | "sports"
  | "education"
  | "etc";

// 인천 2군 9구 (2026년 7월 개편 기준)
export type District =
  // 9구
  | "jemulpo"
  | "yeongjong"
  | "michuhol"
  | "yeonsu"
  | "namdong"
  | "bupyeong"
  | "gyeyang"
  | "seo"
  | "geomdan"
  // 2군
  | "ganghwa"
  | "ongjin";

export type IndoorOutdoor = "indoor" | "outdoor" | "mixed";

// 주최 주체 구분: 공공 / 민간 / 민관 협력
export type OrgType = "public" | "private" | "ppp";

// 반복 유형: none = 기간 내내 연속, weekly = 매주 특정 요일 반복
export type RecurrenceType = "none" | "weekly";

// 상태는 저장하지 않고 날짜로부터 동적으로 계산한다.
export type EventStatus = "upcoming" | "ongoing" | "ended";

export interface EventRecord {
  id: string;
  title: string;
  category: Category;
  /** 운영 시작일 (YYYY-MM-DD) */
  startDate: string;
  /** 운영 종료일 (YYYY-MM-DD) */
  endDate: string;
  /** 반복 유형 */
  recurrenceType: RecurrenceType;
  /** weekly일 때 반복 요일 (0=일 ... 6=토) */
  recurrenceDays: number[];
  /** 시작 시간 (HH:MM, 없으면 종일) */
  startTime: string | null;
  /** 종료 시간 (HH:MM) */
  endTime: string | null;
  venue: string;
  district: District;
  /** 주최 주체 구분 */
  orgType: OrgType;
  /** 주최 */
  organizer: string;
  /** 주관 */
  host: string;
  /** 문의 연락처 (전화/이메일 등) */
  contact: string | null;
  indoorOutdoor: IndoorOutdoor;
  description: string;
  websiteUrl: string | null;
  attachmentUrl: string | null;
  /** 대표 이미지 URL (없으면 카테고리 색 썸네일로 대체) */
  imageUrl: string | null;
  /** 주요(대표) 행사 여부 */
  isFeatured: boolean;
  /** 좋아요(하트) 누적 수 */
  likes: number;
  /** 생성 시각 (ISO 문자열) */
  createdAt: string;
  /** 수정 시각 (ISO 문자열) */
  updatedAt: string;
}

// 등록/수정 폼이 다루는 입력값 (id/타임스탬프/좋아요 제외)
export type EventInput = Omit<
  EventRecord,
  "id" | "createdAt" | "updatedAt" | "likes"
>;

// ── 제보(시민/실무자 제출 → 관리자 검토) ──
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface EventSubmission {
  id: string;
  title: string;
  category: Category | null;
  startDate: string | null;
  endDate: string | null;
  venue: string | null;
  district: District | null;
  organizer: string | null;
  host: string | null;
  description: string | null;
  websiteUrl: string | null;
  /** 제보자 이름 (선택) */
  reporterName: string | null;
  /** 제보자 연락처 (선택) */
  reporterContact: string | null;
  status: SubmissionStatus;
  createdAt: string;
}

// 공개 제보 폼이 다루는 입력값
export type SubmissionInput = Omit<
  EventSubmission,
  "id" | "status" | "createdAt"
>;

// ── 신고(기존 행사 정보 오류·변경 제보) ──
export type IssueStatus = "open" | "resolved";

export interface EventIssue {
  id: string;
  /** 대상 행사 id */
  eventId: string;
  /** 대상 행사명 스냅샷 (행사가 변경·삭제돼도 표시되도록) */
  eventTitle: string;
  /** 신고 내용 */
  message: string;
  reporterContact: string | null;
  status: IssueStatus;
  createdAt: string;
}

export type IssueInput = Omit<EventIssue, "id" | "status" | "createdAt">;

// 행사 목록 검색/필터 조건
export interface EventFilters {
  /** 행사명·장소·주최·주관 통합 검색어 */
  query?: string;
  category?: Category;
  district?: District;
  status?: EventStatus;
  /** 기간 필터: 이 구간과 겹치는 행사 (YYYY-MM-DD) */
  from?: string;
  to?: string;
  /** 정렬 기준 */
  sort?: "start" | "created" | "status";
  /** 종료된 행사 포함 여부 (미지정 시 전부 포함 — 관리자 등) */
  includeEnded?: boolean;
  /** 주요(대표) 행사만 */
  featured?: boolean;
}
