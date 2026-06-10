"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  createSubmission,
  deleteSubmission,
  setSubmissionStatus,
} from "@/lib/data/submissions";
import { CATEGORY_MAP, DISTRICT_MAP } from "@/lib/constants";
import type { Category, District } from "@/lib/types";

export type ReportState = { ok?: boolean; error?: string };

// 공개 제보 제출 (인증 불필요). 대부분 선택 입력, 행사명만 필수.
export async function submitReport(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const title = get("title");
  if (!title) return { error: "행사명을 입력하세요." };

  const startDate = get("startDate") || null;
  const endDate = get("endDate") || null;
  if (startDate && endDate && endDate < startDate) {
    return { error: "종료일은 시작일보다 빠를 수 없습니다." };
  }

  const categoryRaw = get("category");
  const category =
    categoryRaw && categoryRaw in CATEGORY_MAP ? (categoryRaw as Category) : null;
  const districtRaw = get("district");
  const district =
    districtRaw && districtRaw in DISTRICT_MAP
      ? (districtRaw as District)
      : null;

  await createSubmission({
    title,
    category,
    startDate,
    endDate,
    venue: get("venue") || null,
    district,
    organizer: get("organizer") || null,
    host: get("host") || null,
    description: get("description") || null,
    websiteUrl: get("websiteUrl") || null,
    reporterName: get("reporterName") || null,
    reporterContact: get("reporterContact") || null,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return { ok: true };
}

// 관리자: 제보 반려
export async function rejectSubmissionAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAuth();
  const ok = await setSubmissionStatus(id, "rejected");
  if (!ok) return { error: "제보를 찾을 수 없습니다." };
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return {};
}

// 관리자: 제보 삭제
export async function deleteSubmissionAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAuth();
  const ok = await deleteSubmission(id);
  if (!ok) return { error: "제보를 찾을 수 없습니다." };
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return {};
}
