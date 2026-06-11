import "server-only";

import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db/client";
import { images as table } from "@/lib/db/schema";

type StoredImage = { mimeType: string; data: string };

// DB가 없을 때(시드 모드) 사용하는 인메모리 저장소 (재시작 시 초기화).
const memory = new Map<string, StoredImage>();

/** base64 이미지를 저장하고 id를 반환 */
export async function createImage(
  mimeType: string,
  base64: string,
): Promise<string> {
  if (hasDatabase()) {
    const [row] = await getDb()
      .insert(table)
      .values({ mimeType, data: base64 })
      .returning({ id: table.id });
    return row.id;
  }
  const id = crypto.randomUUID();
  memory.set(id, { mimeType, data: base64 });
  return id;
}

export async function getImage(id: string): Promise<StoredImage | null> {
  if (hasDatabase()) {
    const [row] = await getDb()
      .select({ mimeType: table.mimeType, data: table.data })
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    return row ?? null;
  }
  return memory.get(id) ?? null;
}
