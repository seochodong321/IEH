import path from "node:path";
import { defineConfig } from "vitest/config";

// 순수 로직(lib/*)만 테스트한다 — React/DB/네트워크 없는 함수 대상.
// "@/" 경로 별칭은 tsconfig와 동일하게 프로젝트 루트로 매핑.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
});
