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

// 분류값은 lib/constants.ts 의 value 들과 반드시 일치해야 한다.
export const categoryEnum = pgEnum("category", [
  "festival",
  "performance",
  "expo",
  "sports",
  "education",
  "etc",
]);

export const districtEnum = pgEnum("district", [
  "jemulpo",
  "yeongjong",
  "michuhol",
  "yeonsu",
  "namdong",
  "bupyeong",
  "gyeyang",
  "seo",
  "geomdan",
  "ganghwa",
  "ongjin",
]);

export const indoorOutdoorEnum = pgEnum("indoor_outdoor", [
  "indoor",
  "outdoor",
  "mixed",
]);

export const orgTypeEnum = pgEnum("org_type", ["public", "private", "ppp"]);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  category: categoryEnum("category").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  recurrenceType: text("recurrence_type").notNull().default("none"),
  recurrenceDays: integer("recurrence_days").array(),
  venue: text("venue").notNull(),
  district: districtEnum("district").notNull(),
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
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

// 제보: 대부분 선택 입력 (제보자가 모를 수 있음). 검토 시 관리자가 보완해 행사로 전환.
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  category: categoryEnum("category"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  venue: text("venue"),
  district: districtEnum("district"),
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
export type NewSubmissionRow = typeof submissions.$inferInsert;

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

export type ImageRow = typeof images.$inferSelect;
