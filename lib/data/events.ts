import "server-only";

import { eq, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db/client";
import { events as eventsTable, type EventRow } from "@/lib/db/schema";
import { seedEvents } from "@/lib/db/seed-data";
import { computeStatus, occursInRange } from "@/lib/event-utils";
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
    category: r.category,
    startDate: r.startDate,
    endDate: r.endDate,
    recurrenceType: (r.recurrenceType as EventRecord["recurrenceType"]) ?? "none",
    recurrenceDays: r.recurrenceDays ?? [],
    venue: r.venue,
    district: r.district,
    organizer: r.organizer,
    host: r.host,
    indoorOutdoor: r.indoorOutdoor,
    description: r.description ?? "",
    websiteUrl: r.websiteUrl,
    attachmentUrl: r.attachmentUrl,
    imageUrl: r.imageUrl,
    isFeatured: r.isFeatured,
    likes: r.likes ?? 0,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt:
      r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
  };
}

// 입력값을 DB 컬럼 형태로 변환 (camelCase 키는 schema가 매핑)
function inputToValues(input: EventInput) {
  return {
    title: input.title,
    category: input.category,
    startDate: input.startDate,
    endDate: input.endDate,
    recurrenceType: input.recurrenceType,
    recurrenceDays: input.recurrenceDays,
    venue: input.venue,
    district: input.district,
    organizer: input.organizer,
    host: input.host,
    indoorOutdoor: input.indoorOutdoor,
    description: input.description,
    websiteUrl: input.websiteUrl,
    attachmentUrl: input.attachmentUrl,
    imageUrl: input.imageUrl,
    isFeatured: input.isFeatured,
  };
}

async function loadAll(): Promise<EventRecord[]> {
  if (hasDatabase()) {
    const rows = await getDb().select().from(eventsTable);
    return rows.map(rowToRecord);
  }
  return mem().map((e) => ({ ...e }));
}

// 검색/필터는 두 모드에서 동일하게 동작하도록 메모리에서 적용한다.
// (내부 조회용 데이터 규모에서는 충분하며, 모드 간 동작 차이를 없앤다.)
function applyFilters(list: EventRecord[], filters: EventFilters): EventRecord[] {
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
  if (filters.status)
    out = out.filter(
      (e) => computeStatus(e.startDate, e.endDate) === filters.status,
    );
  // 기간 필터: 지정 구간 안에 실제 발생일이 있는 행사만 (반복 패턴 고려)
  if (filters.from || filters.to) {
    const from = filters.from || "0000-01-01";
    const to = filters.to || "9999-12-31";
    out = out.filter((e) => occursInRange(e, from, to));
  }
  // 종료 행사 숨김: includeEnded가 명시적으로 false이고 상태 필터가 없을 때만
  if (filters.includeEnded === false && !filters.status) {
    out = out.filter((e) => computeStatus(e.startDate, e.endDate) !== "ended");
  }
  return out;
}

const STATUS_RANK: Record<string, number> = {
  ongoing: 0,
  upcoming: 1,
  ended: 2,
};

function sortEvents(list: EventRecord[], sort: EventFilters["sort"]) {
  const byStart = (a: EventRecord, b: EventRecord) =>
    a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title);
  if (sort === "created") {
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  if (sort === "status") {
    return list.sort(
      (a, b) =>
        STATUS_RANK[computeStatus(a.startDate, a.endDate)] -
          STATUS_RANK[computeStatus(b.startDate, b.endDate)] || byStart(a, b),
    );
  }
  return list.sort(byStart);
}

/** 전체 행사 (대시보드/캘린더에서 사용) */
export async function getAllEvents(): Promise<EventRecord[]> {
  return loadAll();
}

/** 필터 적용 + 정렬 (목록 페이지) */
export async function getEvents(
  filters: EventFilters = {},
): Promise<EventRecord[]> {
  const all = await loadAll();
  return sortEvents(applyFilters(all, filters), filters.sort);
}

export async function getEventById(id: string): Promise<EventRecord | null> {
  if (hasDatabase()) {
    const rows = await getDb()
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);
    return rows[0] ? rowToRecord(rows[0]) : null;
  }
  return mem().find((e) => e.id === id) ?? null;
}

export async function createEvent(input: EventInput): Promise<EventRecord> {
  if (hasDatabase()) {
    const [row] = await getDb()
      .insert(eventsTable)
      .values(inputToValues(input))
      .returning();
    return rowToRecord(row);
  }
  const now = new Date().toISOString();
  const record: EventRecord = {
    ...input,
    id: crypto.randomUUID(),
    likes: 0,
    createdAt: now,
    updatedAt: now,
  };
  mem().unshift(record);
  return record;
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
