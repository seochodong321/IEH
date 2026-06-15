import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db/client";
import { submissions as table, type SubmissionRow } from "@/lib/db/schema";
import { seedSubmissions } from "@/lib/db/seed-data";
import { toIso } from "@/lib/utils";
import type {
  EventSubmission,
  SubmissionInput,
  SubmissionStatus,
} from "@/lib/types";

// DB가 없을 때 사용하는 인메모리 저장소 (개발/데모용; 재시작 시 시드로 초기화).
let memory: EventSubmission[] | null = null;
function mem(): EventSubmission[] {
  if (!memory) memory = seedSubmissions.map((s) => ({ ...s }));
  return memory;
}

function rowToRecord(r: SubmissionRow): EventSubmission {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    startDate: r.startDate,
    endDate: r.endDate,
    venue: r.venue,
    district: r.district,
    organizer: r.organizer,
    host: r.host,
    description: r.description,
    websiteUrl: r.websiteUrl,
    reporterName: r.reporterName,
    reporterContact: r.reporterContact,
    status: r.status,
    createdAt: toIso(r.createdAt),
  };
}

/** 제보 목록 (status 지정 시 해당 상태만), 최신순 */
export async function getSubmissions(
  status?: SubmissionStatus,
): Promise<EventSubmission[]> {
  if (hasDatabase()) {
    const db = getDb();
    const rows = status
      ? await db.select().from(table).where(eq(table.status, status)).orderBy(desc(table.createdAt))
      : await db.select().from(table).orderBy(desc(table.createdAt));
    return rows.map(rowToRecord);
  }
  const list = mem()
    .filter((s) => !status || s.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list.map((s) => ({ ...s }));
}

export async function getPendingCount(): Promise<number> {
  if (hasDatabase()) {
    const [row] = await getDb()
      .select({ n: count() })
      .from(table)
      .where(eq(table.status, "pending"));
    return row?.n ?? 0;
  }
  return mem().filter((s) => s.status === "pending").length;
}

export async function getSubmissionById(
  id: string,
): Promise<EventSubmission | null> {
  if (hasDatabase()) {
    const rows = await getDb()
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    return rows[0] ? rowToRecord(rows[0]) : null;
  }
  return mem().find((s) => s.id === id) ?? null;
}

export async function createSubmission(
  input: SubmissionInput,
): Promise<EventSubmission> {
  if (hasDatabase()) {
    const [row] = await getDb().insert(table).values(input).returning();
    return rowToRecord(row);
  }
  const record: EventSubmission = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  mem().unshift(record);
  return record;
}

export async function setSubmissionStatus(
  id: string,
  status: SubmissionStatus,
): Promise<boolean> {
  if (hasDatabase()) {
    const res = await getDb()
      .update(table)
      .set({ status })
      .where(eq(table.id, id))
      .returning({ id: table.id });
    return res.length > 0;
  }
  const s = mem().find((x) => x.id === id);
  if (!s) return false;
  s.status = status;
  return true;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  if (hasDatabase()) {
    const res = await getDb()
      .delete(table)
      .where(eq(table.id, id))
      .returning({ id: table.id });
    return res.length > 0;
  }
  const list = mem();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}
