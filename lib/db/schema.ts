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

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  category: categoryEnum("category").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  recurrenceType: text("recurrence_type").notNull().default("none"),
  recurrenceDays: integer("recurrence_days").array(),
  venue: text("venue").notNull(),
  district: districtEnum("district").notNull(),
  organizer: text("organizer").notNull(),
  host: text("host").notNull(),
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
