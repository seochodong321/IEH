import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// .env.local 우선, 없으면 .env (둘 다 gitignore 됨)
config({ path: [".env.local", ".env"] });

// 스키마 반영(DDL)은 풀링되지 않은 직접 연결을 쓰는 게 안전하다(Neon).
const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: url ?? "",
  },
});
