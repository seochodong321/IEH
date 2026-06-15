import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Vercel의 Neon 연동은 DATABASE_URL(또는 POSTGRES_URL)을 자동 주입한다.
function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

/** DB 연결 정보가 있는지 — 없으면 데이터 계층은 시드 데이터로 동작한다. */
export function hasDatabase(): boolean {
  return Boolean(getDatabaseUrl());
}

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/** Neon 드리즐 클라이언트 (지연 생성). DATABASE_URL 없으면 호출하면 안 된다. */
export function getDb() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "DATABASE_URL이 설정되지 않았습니다. Vercel Storage에서 Neon을 연결하거나 .env.local에 추가하세요.",
    );
  }
  if (!_db) {
    _db = drizzle(neon(url), { schema });
  }
  return _db;
}
