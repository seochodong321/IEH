import {
  pgTable,
  pgEnum,
  uuid,
  text,
  date,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// category·district 는 자주 바뀌는 분류라 DB enum 대신 text 로 둔다.
// 유효성은 앱(lib/constants.ts 의 *_MAP)에서 검증하므로, 항목 추가는 코드 수정만으로 된다.

export const indoorOutdoorEnum = pgEnum("indoor_outdoor", [
  "indoor",
  "outdoor",
  "mixed",
]);

export const orgTypeEnum = pgEnum("org_type", ["public", "private", "ppp"]);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  recurrenceType: text("recurrence_type").notNull().default("none"),
  recurrenceDays: integer("recurrence_days").array(),
  venue: text("venue").notNull(),
  district: text("district").notNull(),
  orgType: orgTypeEnum("org_type").notNull().default("public"),
  organizer: text("organizer").notNull(),
  host: text("host").notNull(),
  contact: text("contact"),
  indoorOutdoor: indoorOutdoorEnum("indoor_outdoor").notNull(),
  description: text("description").notNull().default(""),
  websiteUrl: text("website_url"),
  attachmentUrl: text("attachment_url"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  // 게시 여부 — 기존 행은 true로 유지(default), 새 등록은 코드에서 false(대기)로 넣는다.
  published: boolean("published").notNull().default(true),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EventRow = typeof events.$inferSelect;

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

// 제보: 대부분 선택 입력 (제보자가 모를 수 있음). 검토 시 관리자가 보완해 행사로 전환.
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  category: text("category"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  venue: text("venue"),
  district: text("district"),
  organizer: text("organizer"),
  host: text("host"),
  description: text("description"),
  websiteUrl: text("website_url"),
  reporterName: text("reporter_name"),
  reporterContact: text("reporter_contact"),
  status: submissionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SubmissionRow = typeof submissions.$inferSelect;

export const issueStatusEnum = pgEnum("issue_status", ["open", "resolved"]);

// 신고: 기존 행사 정보 오류/변경 제보 → 관리자 검토 후 수정·삭제
export const issues = pgTable("issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  eventTitle: text("event_title").notNull(),
  message: text("message").notNull(),
  reporterContact: text("reporter_contact"),
  status: issueStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type IssueRow = typeof issues.$inferSelect;

// 관리자가 올리는 게시물(공지·관련 소식) → 대시보드 하단 '관련 게시물'에 노출
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  linkUrl: text("link_url"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PostRow = typeof posts.$inferSelect;

// 업로드 이미지 저장소 (Neon에 base64로 보관, /api/images/[id]로 서빙).
// events 행을 가볍게 유지하려고 별도 테이블에 둔다.
export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  mimeType: text("mime_type").notNull(),
  data: text("data").notNull(), // base64
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
