// Neon(Postgres)에 샘플 행사 데이터를 적재한다.
// 사용: 스키마 생성(npm run db:push) 후 → npm run db:seed
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { events, submissions } from "../lib/db/schema";
import { seedEvents, seedSubmissions } from "../lib/db/seed-data";

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL(또는 POSTGRES_URL)이 필요합니다. .env.local 에 설정하세요.",
    );
  }

  const db = drizzle(neon(url), { schema: { events, submissions } });

  let inserted = 0;
  for (const e of seedEvents) {
    const values = {
      id: e.id,
      title: e.title,
      category: e.category,
      startDate: e.startDate,
      endDate: e.endDate,
      recurrenceType: e.recurrenceType,
      recurrenceDays: e.recurrenceDays,
      venue: e.venue,
      district: e.district,
      organizer: e.organizer,
      host: e.host,
      indoorOutdoor: e.indoorOutdoor,
      description: e.description,
      websiteUrl: e.websiteUrl,
      attachmentUrl: e.attachmentUrl,
      imageUrl: e.imageUrl,
      isFeatured: e.isFeatured,
      likes: e.likes,
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
    };
    // 이미 있으면 갱신(upsert) — 새 컬럼 백필 + 시드 상태로 정렬.
    // ⚠️ likes도 시드값으로 덮어쓰므로, 실제 좋아요가 쌓인 뒤에는 재시드 주의.
    const { id: _id, ...updateSet } = values;
    const res = await db
      .insert(events)
      .values(values)
      .onConflictDoUpdate({ target: events.id, set: updateSet })
      .returning({ id: events.id });
    inserted += res.length;
  }

  let subInserted = 0;
  for (const s of seedSubmissions) {
    const res = await db
      .insert(submissions)
      .values({
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
      })
      .onConflictDoNothing({ target: submissions.id })
      .returning({ id: submissions.id });
    subInserted += res.length;
  }

  console.log(
    `시드 완료: 행사 ${inserted}/${seedEvents.length}건 적재(upsert), 제보 ${subInserted}/${seedSubmissions.length}건 신규.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
