import "server-only";

import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db/client";
import { events as eventsTable, type EventRow } from "@/lib/db/schema";
import { seedEvents } from "@/lib/db/seed-data";
import {
  compareByStatus,
  computeStatus,
  occursInRange,
  todayKST,
} from "@/lib/event-utils";
import { toIso } from "@/lib/utils";
import { asCategory } from "@/lib/constants";
import type { EventFilters, EventInput, EventRecord } from "@/lib/types";

// DB가 없을 때 사용하는 인메모리 저장소.
// 개발/데모용이며, 서버 프로세스가 재시작되면 시드 데이터로 초기화된다.
let memory: EventRecord[] | null = null;
function mem(): EventRecord[] {
  if (!memory) memory = seedEvents.map((e) => ({ ...e }));
  return memory;
}

function rowToRecord(r: EventRow): EventRecord {
  return {
    id: r.id,
    title: r.title,
    category: asCategory(r.category),
    startDate: r.startDate,
    endDate: r.endDate,
    startTime: r.startTime,
    endTime: r.endTime,
    recurrenceType: (r.recurrenceType as EventRecord["recurrenceType"]) ?? "none",
    recurrenceDays: r.recurrenceDays ?? [],
    venue: r.venue,
    district: r.district as EventRecord["district"],
    orgType: (r.orgType as EventRecord["orgType"]) ?? "public",
    organizer: r.organizer,
    host: r.host,
    contact: r.contact,
    indoorOutdoor: r.indoorOutdoor,
    description: r.description ?? "",
    websiteUrl: r.websiteUrl,
    attachmentUrl: r.attachmentUrl,
    imageUrl: r.imageUrl,
    isFeatured: r.isFeatured,
    published: r.published ?? true,
    likes: r.likes ?? 0,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

// 입력값을 DB 컬럼 형태로 변환 (camelCase 키는 schema가 매핑)
function inputToValues(input: EventInput) {
  return {
    title: input.title,
    category: input.category,
    startDate: input.startDate,
    endDate: input.endDate,
    startTime: input.startTime,
    endTime: input.endTime,
    recurrenceType: input.recurrenceType,
    recurrenceDays: input.recurrenceDays,
    venue: input.venue,
    district: input.district,
    orgType: input.orgType,
    organizer: input.organizer,
    host: input.host,
    contact: input.contact,
    indoorOutdoor: input.indoorOutdoor,
    description: input.description,
    websiteUrl: input.websiteUrl,
    attachmentUrl: input.attachmentUrl,
    imageUrl: input.imageUrl,
    isFeatured: input.isFeatured,
  };
}

// includeUnpublished=false(기본)면 게시된 행사만 반환 (공개 화면용).
// 관리자 화면은 true로 호출해 대기 행사까지 포함한다.
async function loadAll(includeUnpublished = false): Promise<EventRecord[]> {
  let records: EventRecord[];
  if (hasDatabase()) {
    const rows = await getDb().select().from(eventsTable);
    records = rows.map(rowToRecord);
  } else {
    records = mem().map((e) => ({ ...e }));
  }
  return includeUnpublished ? records : records.filter((e) => e.published);
}

// 검색/필터는 두 모드에서 동일하게 동작하도록 메모리에서 적용한다.
// (내부 조회용 데이터 규모에서는 충분하며, 모드 간 동작 차이를 없앤다.)
function applyFilters(
  list: EventRecord[],
  filters: EventFilters,
  today: string,
): EventRecord[] {
  let out = list;
  const q = filters.query?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.host.toLowerCase().includes(q),
    );
  }
  if (filters.category) out = out.filter((e) => e.category === filters.category);
  if (filters.district) out = out.filter((e) => e.district === filters.district);
  if (filters.featured) out = out.filter((e) => e.isFeatured);
  if (filters.status)
    out = out.filter(
      (e) => computeStatus(e.startDate, e.endDate, today) === filters.status,
    );
  // 기간 필터: 지정 구간 안에 실제 발생일이 있는 행사만 (반복 패턴 고려)
  if (filters.from || filters.to) {
    const from = filters.from || "0000-01-01";
    const to = filters.to || "9999-12-31";
    out = out.filter((e) => occursInRange(e, from, to));
  }
  // 종료 행사 숨김: includeEnded가 명시적으로 false이고 상태 필터가 없을 때만
  if (filters.includeEnded === false && !filters.status) {
    out = out.filter(
      (e) => computeStatus(e.startDate, e.endDate, today) !== "ended",
    );
  }
  return out;
}

function sortEvents(
  list: EventRecord[],
  sort: EventFilters["sort"],
  today: string,
) {
  const byStart = (a: EventRecord, b: EventRecord) =>
    a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title);
  if (sort === "created") {
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  if (sort === "status") {
    return list.sort((a, b) => compareByStatus(a, b, today));
  }
  return list.sort(byStart);
}

/** 게시된 전체 행사 (대시보드/캘린더 등 공개 화면) */
export async function getAllEvents(): Promise<EventRecord[]> {
  return loadAll();
}

/** 필터 적용 + 정렬 (공개 목록 페이지). 게시된 행사만 노출 */
export async function getEvents(
  filters: EventFilters = {},
): Promise<EventRecord[]> {
  const all = await loadAll();
  // 기준일은 요청당 한 번만 계산 (필터·정렬 전체가 같은 '오늘'을 공유)
  const today = todayKST();
  return sortEvents(applyFilters(all, filters, today), filters.sort, today);
}

/** 관리자용 전체 행사 (대기 포함). 대기 행사를 맨 위로, 그 다음 상태순 */
export async function getAdminEvents(): Promise<EventRecord[]> {
  const all = await loadAll(true);
  const today = todayKST();
  return all.sort((a, b) => {
    if (a.published !== b.published) return a.published ? 1 : -1; // 대기 먼저
    return compareByStatus(a, b, today);
  });
}

/** id 단건 조회. React.cache로 같은 요청 내 중복 호출(메타데이터+페이지)을 1회로 합친다 */
export const getEventById = cache(
  async (id: string): Promise<EventRecord | null> => {
    if (hasDatabase()) {
      const rows = await getDb()
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.id, id))
        .limit(1);
      return rows[0] ? rowToRecord(rows[0]) : null;
    }
    return mem().find((e) => e.id === id) ?? null;
  },
);

// 새 행사는 항상 대기(published=false) 상태로 생성 — 관리자 승인 후 게시된다.
export async function createEvent(input: EventInput): Promise<EventRecord> {
  if (hasDatabase()) {
    const [row] = await getDb()
      .insert(eventsTable)
      .values({ ...inputToValues(input), published: false })
      .returning();
    return rowToRecord(row);
  }
  const now = new Date().toISOString();
  const record: EventRecord = {
    ...input,
    id: crypto.randomUUID(),
    published: false,
    likes: 0,
    createdAt: now,
    updatedAt: now,
  };
  mem().unshift(record);
  return record;
}

/** 같은 제목(공백·대소문자 무시) + 같은 시작일의 행사 (대기 포함) — 중복 등록 경고용 */
export async function findDuplicateEvents(
  title: string,
  startDate: string,
  excludeId?: string,
): Promise<EventRecord[]> {
  const norm = title.trim().toLowerCase();
  if (!norm || !startDate) return [];
  const all = await loadAll(true);
  return all.filter(
    (e) =>
      e.id !== excludeId &&
      e.startDate === startDate &&
      e.title.trim().toLowerCase() === norm,
  );
}

/** 게시 여부 설정 (승인 = true). 대상이 없으면 false */
export async function setEventPublished(
  id: string,
  published: boolean,
): Promise<boolean> {
  if (hasDatabase()) {
    const res = await getDb()
      .update(eventsTable)
      .set({ published })
      .where(eq(eventsTable.id, id))
      .returning({ id: eventsTable.id });
    return res.length > 0;
  }
  const e = mem().find((x) => x.id === id);
  if (!e) return false;
  e.published = published;
  return true;
}

export async function updateEvent(
  id: string,
  input: EventInput,
): Promise<EventRecord | null> {
  if (hasDatabase()) {
    const [row] = await getDb()
      .update(eventsTable)
      .set({ ...inputToValues(input), updatedAt: new Date() })
      .where(eq(eventsTable.id, id))
      .returning();
    return row ? rowToRecord(row) : null;
  }
  const list = mem();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...input, updatedAt: new Date().toISOString() };
  return list[idx];
}

/** 좋아요 증감 (delta: +1 / -1). 새 좋아요 수 반환, 없으면 null. 0 미만으로 내려가지 않음. */
export async function addLike(
  id: string,
  delta: number,
): Promise<number | null> {
  if (hasDatabase()) {
    const [row] = await getDb()
      .update(eventsTable)
      .set({ likes: sql`GREATEST(${eventsTable.likes} + ${delta}, 0)` })
      .where(eq(eventsTable.id, id))
      .returning({ likes: eventsTable.likes });
    return row ? row.likes : null;
  }
  const e = mem().find((x) => x.id === id);
  if (!e) return null;
  e.likes = Math.max(0, e.likes + delta);
  return e.likes;
}

export async function deleteEvent(id: string): Promise<boolean> {
  if (hasDatabase()) {
    const res = await getDb()
      .delete(eventsTable)
      .where(eq(eventsTable.id, id))
      .returning({ id: eventsTable.id });
    return res.length > 0;
  }
  const list = mem();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}
