"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import {
  addLike,
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/lib/data/events";
import { createImage } from "@/lib/data/images";
import { setSubmissionStatus } from "@/lib/data/submissions";
import {
  CATEGORY_MAP,
  DISTRICT_MAP,
  INDOOR_OUTDOOR_MAP,
  ORG_TYPE_MAP,
} from "@/lib/constants";
import type {
  Category,
  District,
  EventInput,
  IndoorOutdoor,
  OrgType,
} from "@/lib/types";

export type FormState = { error?: string };

const TIME_RE = /^\d{2}:\d{2}$/;

// 성공 시 EventInput, 실패 시 오류 메시지(string)를 반환한다.
// imageUrl 은 여기서 currentImageUrl(기존값)로 채우고, 새 파일 업로드 시 액션에서 덮어쓴다.
function parseEvent(formData: FormData): EventInput | string {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const title = get("title");
  const category = get("category") as Category;
  const startDate = get("startDate");
  const endDate = get("endDate");
  const startTime = get("startTime");
  const endTime = get("endTime");
  const venue = get("venue");
  const district = get("district") as District;
  const orgType = get("orgType") as OrgType;
  const organizer = get("organizer");
  const host = get("host");
  const contact = get("contact");
  const indoorOutdoor = get("indoorOutdoor") as IndoorOutdoor;
  const description = get("description");
  const websiteUrl = get("websiteUrl");
  const attachmentUrl = get("attachmentUrl");
  const isFeatured = formData.get("isFeatured") === "on";
  const recurrenceType = get("recurrenceType") === "weekly" ? "weekly" : "none";
  const recurrenceDays =
    recurrenceType === "weekly"
      ? [
          ...new Set(
            String(formData.get("recurrenceDays") ?? "")
              .split(",")
              .map((s) => parseInt(s, 10))
              .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6),
          ),
        ].sort((a, b) => a - b)
      : [];

  if (!title) return "행사명을 입력하세요.";
  if (!(category in CATEGORY_MAP)) return "행사유형을 선택하세요.";
  if (!startDate || !endDate) return "시작일과 종료일을 입력하세요.";
  if (endDate < startDate) return "종료일은 시작일보다 빠를 수 없습니다.";
  if (startTime && !TIME_RE.test(startTime)) return "시작 시간 형식이 올바르지 않습니다.";
  if (endTime && !TIME_RE.test(endTime)) return "종료 시간 형식이 올바르지 않습니다.";
  if (!venue) return "장소를 입력하세요.";
  if (!(district in DISTRICT_MAP)) return "권역을 선택하세요.";
  if (!(orgType in ORG_TYPE_MAP)) return "주최 구분을 선택하세요.";
  if (!organizer) return "주최기관을 입력하세요.";
  if (!host) return "주관기관을 입력하세요.";
  if (!(indoorOutdoor in INDOOR_OUTDOOR_MAP)) return "실내/실외를 선택하세요.";
  if (recurrenceType === "weekly" && recurrenceDays.length === 0)
    return "반복 요일을 하나 이상 선택하세요.";

  return {
    title,
    category,
    startDate,
    endDate,
    startTime: startTime || null,
    endTime: endTime || null,
    recurrenceType,
    recurrenceDays,
    venue,
    district,
    orgType,
    organizer,
    host,
    contact: contact || null,
    indoorOutdoor,
    description,
    websiteUrl: websiteUrl || null,
    attachmentUrl: attachmentUrl || null,
    imageUrl: get("currentImageUrl") || null,
    isFeatured,
  };
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

// 새 이미지 파일이 있으면 Neon(images 테이블)에 저장하고 서빙 경로를 반환한다.
// 파일이 없으면 null(=기존 imageUrl 유지). 실패 시 throw.
async function maybeUploadImage(formData: FormData): Promise<string | null> {
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("이미지는 4MB 이하만 업로드할 수 있습니다.");
  }
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const id = await createImage(file.type, base64);
  return `/api/images/${id}`;
}

function revalidateAll(id?: string) {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/admin");
  if (id) revalidatePath(`/events/${id}`);
}

export async function createEventAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const parsed = parseEvent(formData);
  if (typeof parsed === "string") return { error: parsed };
  try {
    const uploaded = await maybeUploadImage(formData);
    if (uploaded) parsed.imageUrl = uploaded;
  } catch (e) {
    return {
      error:
        "이미지 업로드 실패: " +
        (e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요."),
    };
  }
  await createEvent(parsed);
  // 제보로부터 등록된 경우 해당 제보를 승인 처리
  const fromSubmission = String(formData.get("fromSubmission") ?? "");
  if (fromSubmission) {
    await setSubmissionStatus(fromSubmission, "approved");
    revalidatePath("/admin/reports");
  }
  revalidateAll();
  redirect("/admin");
}

export async function updateEventAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const parsed = parseEvent(formData);
  if (typeof parsed === "string") return { error: parsed };
  try {
    const uploaded = await maybeUploadImage(formData);
    if (uploaded) parsed.imageUrl = uploaded;
  } catch (e) {
    return {
      error:
        "이미지 업로드 실패: " +
        (e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요."),
    };
  }
  const updated = await updateEvent(id, parsed);
  if (!updated) return { error: "행사를 찾을 수 없습니다." };
  revalidateAll(id);
  redirect("/admin");
}

// 좋아요 토글 (공개 — 인증 불필요). 새 좋아요 수 반환.
export async function toggleLikeAction(
  id: string,
  liked: boolean,
): Promise<{ count?: number; error?: string }> {
  const count = await addLike(id, liked ? 1 : -1);
  if (count === null) return { error: "행사를 찾을 수 없습니다." };
  revalidatePath(`/events/${id}`);
  return { count };
}

export async function deleteEventAction(id: string): Promise<FormState> {
  await requireAuth();
  const ok = await deleteEvent(id);
  if (!ok) return { error: "행사를 찾을 수 없습니다." };
  revalidateAll(id);
  return {};
}
