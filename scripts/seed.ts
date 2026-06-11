// Neon(Postgres)에 샘플 행사/제보 데이터를 적재한다.
// 사용: 스키마 생성(npm run db:push) 후 → npm run db:seed
//
// ⚠️ neon-http로 행을 하나씩 await 하면 일부가 조용히 누락될 수 있어,
//    반드시 "한 번의 벌크 INSERT" (단일 트랜잭션)로 넣는다.
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { getTableColumns, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { events, submissions } from "../lib/db/schema";
import { seedEvents, seedSubmissions } from "../lib/db/seed-data";

async function main() {
  // 적재(DDL성 대량 쓰기)는 직접연결(unpooled)이 더 안정적
  const url =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL(또는 POSTGRES_URL)이 필요합니다. .env.local 에 설정하세요.",
    );
  }

  const db = drizzle(neon(url), { schema: { events, submissions } });

  const eventValues = seedEvents.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    startDate: e.startDate,
    endDate: e.endDate,
    startTime: e.startTime,
    endTime: e.endTime,
    recurrenceType: e.recurrenceType,
    recurrenceDays: e.recurrenceDays,
    venue: e.venue,
    district: e.district,
    orgType: e.orgType,
    organizer: e.organizer,
    host: e.host,
    contact: e.contact,
    indoorOutdoor: e.indoorOutdoor,
    description: e.description,
    websiteUrl: e.websiteUrl,
    attachmentUrl: e.attachmentUrl,
    imageUrl: e.imageUrl,
    isFeatured: e.isFeatured,
    likes: e.likes,
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt),
  }));

  // 충돌(이미 있는 행) 시 EXCLUDED로 갱신하되, 아래 컬럼은 보존한다.
  // - likes: 실제 누적된 좋아요를 시드값으로 덮어쓰지 않기 위함(데이터 유실 방지)
  // - createdAt: 최초 등록 시각 유지
  const PRESERVE_ON_CONFLICT = new Set(["id", "likes", "createdAt"]);
  const eCols = getTableColumns(events);
  const eventSet = Object.fromEntries(
    Object.entries(eCols)
      .filter(([key]) => !PRESERVE_ON_CONFLICT.has(key))
      .map(([key, col]) => [key, sql.raw(`excluded."${col.name}"`)]),
  );

  await db
    .insert(events)
    .values(eventValues)
    .onConflictDoUpdate({ target: events.id, set: eventSet });

  const submissionValues = seedSubmissions.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    startDate: s.startDate,
    endDate: s.endDate,
    venue: s.venue,
    district: s.district,
    organizer: s.organizer,
    host: s.host,
    description: s.description,
    websiteUrl: s.websiteUrl,
    reporterName: s.reporterName,
    reporterContact: s.reporterContact,
    status: s.status,
    createdAt: new Date(s.createdAt),
  }));

  await db
    .insert(submissions)
    .values(submissionValues)
    .onConflictDoNothing({ target: submissions.id });

  const [{ ec }] = await db
    .select({ ec: sql<number>`count(*)::int` })
    .from(events);
  const [{ sc }] = await db
    .select({ sc: sql<number>`count(*)::int` })
    .from(submissions);

  console.log(
    `시드 완료: 행사 테이블 ${ec}건 / ${seedEvents.length}, 제보 테이블 ${sc}건 / ${seedSubmissions.length}.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
