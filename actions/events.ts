"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import {
  EVENTS_TAG,
  addLike,
  createEvent,
  deleteEvent,
  getEventById,
  setEventPublished,
  setEventsPublished,
  updateEvent,
} from "@/lib/data/events";
import { createImage, deleteImage } from "@/lib/data/images";
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
const URL_RE = /^https?:\/\/\S+$/;

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
  // http(s) 만 허용 — javascript: 링크·ICS 줄바꿈 주입 차단
  if (websiteUrl && !URL_RE.test(websiteUrl))
    return "웹사이트 주소는 http(s)로 시작하는 URL이어야 합니다.";
  if (attachmentUrl && !URL_RE.test(attachmentUrl))
    return "첨부 주소는 http(s)로 시작하는 URL이어야 합니다.";

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

// SVG 는 스크립트 실행이 가능해 제외 — 래스터 포맷만 허용
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

// 새 이미지 파일이 있으면 Neon(images 테이블)에 저장하고 서빙 경로를 반환한다.
// 파일이 없으면 null(=기존 imageUrl 유지). 실패 시 throw.
async function maybeUploadImage(formData: FormData): Promise<string | null> {
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("PNG·JPEG·WebP·GIF 이미지만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("이미지는 4MB 이하만 업로드할 수 있습니다.");
  }
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const id = await createImage(file.type, base64);
  return `/api/images/${id}`;
}

// 우리가 저장한 업로드 이미지("/api/images/{id}")면 id를, 아니면 null을 반환
function uploadedImageId(url: string | null | undefined): string | null {
  const m = url?.match(/^\/api\/images\/([0-9a-f-]{36})$/i);
  return m ? m[1] : null;
}

function revalidateAll(id?: string) {
  updateTag(EVENTS_TAG); // 공개 조회 캐시(loadPublished) 즉시 만료 → 바로 최신 반영
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
  let replacedImageId: string | null = null;
  let uploadedUrl: string | null = null;
  try {
    uploadedUrl = await maybeUploadImage(formData);
    if (uploadedUrl) {
      // 포스터 교체 시 옛 업로드 이미지는 수정 성공 후 삭제 (고아 행 방지)
      const prev = await getEventById(id);
      replacedImageId = uploadedImageId(prev?.imageUrl);
      parsed.imageUrl = uploadedUrl;
    }
  } catch (e) {
    return {
      error:
        "이미지 업로드 실패: " +
        (e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요."),
    };
  }
  const updated = await updateEvent(id, parsed);
  if (!updated) {
    // 수정 대상이 사라졌으면 방금 올린 이미지도 정리 (고아 행 방지)
    const newImageId = uploadedImageId(uploadedUrl);
    if (newImageId) await deleteImage(newImageId);
    return { error: "행사를 찾을 수 없습니다." };
  }
  if (replacedImageId) await deleteImage(replacedImageId);
  revalidateAll(id);
  redirect("/admin");
}

// 좋아요 토글 (공개 — 인증 불필요). 새 좋아요 수 반환.
// EVENTS_TAG는 일부러 갱신하지 않는다 — 상세 페이지는 캐시를 안 타서 항상 최신이고,
// 통계의 좋아요 순위가 최대 5분 늦는 대신 좋아요마다 캐시가 깨지는 걸 막는다.
export async function toggleLikeAction(
  id: string,
  liked: boolean,
): Promise<{ count?: number; error?: string }> {
  const count = await addLike(id, liked ? 1 : -1);
  if (count === null) return { error: "행사를 찾을 수 없습니다." };
  revalidatePath(`/events/${id}`);
  return { count };
}

// 대기 행사 승인(게시). 관리자 전용.
export async function approveEventAction(id: string): Promise<FormState> {
  await requireAuth();
  const ok = await setEventPublished(id, true);
  if (!ok) return { error: "행사를 찾을 수 없습니다." };
  revalidateAll(id);
  return {};
}

// 대기 행사 일괄 승인. 관리자 전용. (단일 IN 쿼리)
export async function approveEventsAction(ids: string[]): Promise<FormState> {
  await requireAuth();
  await setEventsPublished(ids, true);
  revalidateAll();
  return {};
}

export async function deleteEventAction(id: string): Promise<FormState> {
  await requireAuth();
  const prev = await getEventById(id);
  const ok = await deleteEvent(id);
  if (!ok) return { error: "행사를 찾을 수 없습니다." };
  // 행사와 함께 업로드 이미지도 정리 (고아 행 방지)
  const imageId = uploadedImageId(prev?.imageUrl);
  if (imageId) await deleteImage(imageId);
  revalidateAll(id);
  return {};
}
