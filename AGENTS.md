<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 작업 원칙: 이미 있는 구조 안에서, 가장 단순하게

기존 구조를 먼저 파악하고 그 안에서 푼다. **새 의존성·외부 서비스·스토리지·추상화는 명백히 필요할 때만**, 그리고 제안 전에 먼저 물어본다. 쉽게 풀릴 일을 새 도구로 어렵게 만들지 않는다.

## 이미 있는 것 (이걸 재사용)
- **저장소: Neon Postgres 하나 + Drizzle ORM** (`lib/db/`). `DATABASE_URL` 없으면 인메모리 시드 모드로 자동 폴백. → 다른 DB·스토리지 서비스를 새로 붙이지 말 것.
- **데이터 접근은 전부 `lib/data/*.ts` 경유** (events·submissions·issues·images·posts), DB/시드 양쪽 모드 지원. 새 기능도 이 계층에 함수로 추가.
- **공개 조회는 태그 캐시**: 행사·게시물 공개 목록은 `unstable_cache`(태그 `events`/`posts`, 5분 그물망) → **데이터를 변경하는 액션은 반드시 `updateTag(EVENTS_TAG|POSTS_TAG)` 호출**(actions/events.ts·posts.ts의 revalidate 헬퍼가 이미 함). 관리자 조회는 캐시 없이 항상 최신.
- **이미지는 별도 블롭 스토어 없음** — `images` 테이블(base64)에 저장하고 `/api/images/[id]`로 서빙. 이미지 관련은 이 패턴 재사용(S3 등 추가 금지).
- **분류값: `category`·`district`는 text 컬럼**이고 앱의 `*_MAP`(lib/constants.ts)으로 검증 → 항목 추가/변경은 **코드 수정만, 마이그레이션 불필요**. `org_type`·`indoor_outdoor`만 enum.
- **인증: 쿠키 세션**(`lib/auth.ts`), `ADMIN_PASSWORD`·`SESSION_SECRET` 환경변수(Vercel). 새 인증 라이브러리 붙이지 말 것.
- **배포: Vercel, `main` 푸시 시 자동.** 푸시 전 `npx tsc --noEmit` + `npm run build` 통과 확인.

## DB 스키마를 꼭 바꿔야 할 때만
- 새 컬럼/타입 변경 SQL은 **Neon 콘솔(Open in Neon) → SQL Editor**에서 실행. (Vercel 대시보드의 Query 탭은 읽기 전용이라 DDL 불가)
- 순서: **DB 마이그레이션 먼저 → 코드 푸시.** 반대로 하면 라이브 사이트가 깨진다.
