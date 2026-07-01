import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db/client";
import { posts as table, type PostRow } from "@/lib/db/schema";
import { toIso } from "@/lib/utils";
import type { Post, PostInput } from "@/lib/types";

// DB가 없을 때(시드 모드) 사용하는 인메모리 저장소 (재시작 시 초기화).
const memory: Post[] = [];

function rowToRecord(r: PostRow): Post {
  return {
    id: r.id,
    title: r.title,
    content: r.content ?? "",
    linkUrl: r.linkUrl,
    imageUrl: r.imageUrl,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

/** 최신순 게시물. limit 지정 시 그만큼만 */
export async function getPosts(limit?: number): Promise<Post[]> {
  if (hasDatabase()) {
    const q = getDb().select().from(table).orderBy(desc(table.createdAt));
    const rows = await (limit ? q.limit(limit) : q);
    return rows.map(rowToRecord);
  }
  const list = [...memory].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return limit ? list.slice(0, limit) : list;
}

export async function getPostById(id: string): Promise<Post | null> {
  if (hasDatabase()) {
    const rows = await getDb()
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    return rows[0] ? rowToRecord(rows[0]) : null;
  }
  return memory.find((p) => p.id === id) ?? null;
}

export async function createPost(input: PostInput): Promise<Post> {
  if (hasDatabase()) {
    const [row] = await getDb().insert(table).values(input).returning();
    return rowToRecord(row);
  }
  const now = new Date().toISOString();
  const record: Post = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  memory.unshift(record);
  return record;
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<Post | null> {
  if (hasDatabase()) {
    const [row] = await getDb()
      .update(table)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(table.id, id))
      .returning();
    return row ? rowToRecord(row) : null;
  }
  const p = memory.find((x) => x.id === id);
  if (!p) return null;
  Object.assign(p, input, { updatedAt: new Date().toISOString() });
  return p;
}

export async function deletePost(id: string): Promise<boolean> {
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
