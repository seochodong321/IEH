import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db/client";
import { issues as table, type IssueRow } from "@/lib/db/schema";
import type { EventIssue, IssueInput, IssueStatus } from "@/lib/types";

// DB가 없을 때(시드 모드) 사용하는 인메모리 저장소 (재시작 시 초기화).
let memory: EventIssue[] = [];

function rowToRecord(r: IssueRow): EventIssue {
  return {
    id: r.id,
    eventId: r.eventId,
    eventTitle: r.eventTitle,
    message: r.message,
    reporterContact: r.reporterContact,
    status: r.status,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  };
}

export async function getIssues(status?: IssueStatus): Promise<EventIssue[]> {
  if (hasDatabase()) {
    const db = getDb();
    const rows = status
      ? await db.select().from(table).where(eq(table.status, status)).orderBy(desc(table.createdAt))
      : await db.select().from(table).orderBy(desc(table.createdAt));
    return rows.map(rowToRecord);
  }
  return memory
    .filter((i) => !status || i.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => ({ ...i }));
}

export async function getOpenIssueCount(): Promise<number> {
  return (await getIssues("open")).length;
}

export async function createIssue(input: IssueInput): Promise<EventIssue> {
  if (hasDatabase()) {
    const [row] = await getDb().insert(table).values(input).returning();
    return rowToRecord(row);
  }
  const record: EventIssue = {
    ...input,
    id: crypto.randomUUID(),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  memory.unshift(record);
  return record;
}

export async function setIssueStatus(
  id: string,
  status: IssueStatus,
): Promise<boolean> {
  if (hasDatabase()) {
    const res = await getDb()
      .update(table)
      .set({ status })
      .where(eq(table.id, id))
      .returning({ id: table.id });
    return res.length > 0;
  }
  const i = memory.find((x) => x.id === id);
  if (!i) return false;
  i.status = status;
  return true;
}

export async function deleteIssue(id: string): Promise<boolean> {
  if (hasDatabase()) {
    const res = await getDb()
      .delete(table)
      .where(eq(table.id, id))
      .returning({ id: table.id });
    return res.length > 0;
  }
  const idx = memory.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  memory.splice(idx, 1);
  return true;
}
