# 인천 행사 상황판 (Incheon Event Radar)

인천에서 열리는 행사·축제·공연·박람회·체육행사를 한 화면에서 조회하는 **내부 실무자용 상황판**입니다. "지금 인천에서 무슨 행사가 진행 중인가"를 빠르게 확인하는 데 초점을 맞춘 조회 중심 서비스입니다.

- 일반 사용자: 로그인 없이 URL 접속만으로 조회
- 관리자: 비밀번호로 로그인 후 행사 등록·수정·삭제

## 주요 기능

- **대시보드** — 오늘/이번 주/이번 달/진행 중 행사 수, 주요 행사 카드, 최근 등록 행사
- **행사 목록** — 표 형태 + 검색(행사명·장소·주최·주관) + 필터(유형·상태·권역)
- **캘린더** — 월간 캘린더에 행사 기간 표시, 날짜 클릭 시 해당일 행사 목록
- **행사 상세** — 전체 정보, 홈페이지·첨부파일 링크
- **관리자** — 행사 CRUD (간단 비밀번호 로그인)

> 상태(예정/진행중/종료)는 저장하지 않고 시작일·종료일과 오늘 날짜(Asia/Seoul)로 **자동 계산**됩니다.

## 기술 스택

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Drizzle ORM · Neon(Postgres) · Vercel

## 로컬 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

**DB 설정 없이 바로 동작합니다.** `DATABASE_URL` 이 없으면 내장 샘플 데이터(시드 모드)로 모든 화면이 작동합니다. (시드 모드에서의 등록/수정/삭제는 서버 메모리에만 반영되며, 서버 재시작 시 초기화됩니다.)

관리자 로그인: 기본 비밀번호는 `admin1234` 입니다. 변경하려면 `.env.example` 을 복사해 `.env.local` 을 만들고 `ADMIN_PASSWORD` 를 설정하세요.

## 데이터 모드

| 모드 | 조건 | 동작 |
|---|---|---|
| 시드 모드 | `DATABASE_URL` 없음 | 내장 샘플 16건, 변경은 메모리에만 임시 반영 |
| DB 모드 | `DATABASE_URL` 있음 | Neon(Postgres)에 영구 저장 |

데이터 접근은 모두 [lib/data/events.ts](lib/data/events.ts) 한 곳을 거치며, 위 분기는 화면 코드와 무관하게 처리됩니다.

## Vercel + Neon 배포

이미 GitHub·Vercel 이 연결되어 있다면 `git push` 만으로 자동 배포됩니다. 데이터를 영구 저장하려면 Vercel에서 Neon을 연결하세요.

1. **DB 연결** — Vercel 프로젝트 → **Storage** 탭 → **Neon (Postgres)** 추가.
   연결하면 `DATABASE_URL` 등이 프로젝트 환경변수로 **자동 주입**됩니다.
2. **관리자 비밀번호 설정** — Vercel → Settings → Environment Variables 에 `ADMIN_PASSWORD` 추가.
3. **스키마 생성 & 시드** — 로컬 `.env.local` 에 Neon 연결 문자열을 넣고:
   ```bash
   npm run db:push   # events 테이블 생성
   npm run db:seed   # 샘플 데이터 적재 (선택)
   ```
   (Neon 연결 문자열은 Vercel Storage → Neon → `.env.local` 탭 또는 Neon 대시보드에서 복사)
4. **배포** — `git push` → Vercel 자동 빌드/배포.

> Neon은 Vercel Marketplace를 통한 Postgres로, 2024년 종료된 "Vercel Postgres"의 공식 후속입니다. 별도 회원가입 없이 Vercel 대시보드에서 바로 추가할 수 있습니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run db:push` | Drizzle 스키마를 DB에 반영 |
| `npm run db:seed` | 샘플 데이터 적재 |
| `npm run db:studio` | Drizzle Studio (DB 뷰어) |

## 폴더 구조

```
app/            라우트 (대시보드 / events / calendar / admin)
components/     UI 컴포넌트 (ui/ 는 shadcn)
actions/        Server Actions (행사 CRUD, 로그인)
lib/
  data/events.ts   데이터 접근 계층 (Neon ↔ 시드 폴백)
  db/              Drizzle 스키마 · Neon 클라이언트 · 샘플 데이터
  constants.ts     카테고리·권역·상태 정의
  event-utils.ts   날짜·상태 계산
  auth.ts          관리자 세션
middleware.ts   /admin 보호
```

## 향후 계획

- Phase 2: 지도 기반 조회, 행사 중복 확인, 주요 행사 강조
- Phase 3: 행사 URL 입력 시 AI 자동 분석·추출
- Phase 4: 인천시·군구·공공기관 행사 AI 자동 수집 + 관리자 검수
