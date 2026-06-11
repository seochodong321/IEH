"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  createIssue,
  deleteIssue,
  setIssueStatus,
} from "@/lib/data/issues";

export type IssueState = { ok?: boolean; error?: string };

// 공개 신고 제출 (인증 불필요)
export async function reportIssue(
  _prev: IssueState,
  formData: FormData,
): Promise<IssueState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const eventId = get("eventId");
  const eventTitle = get("eventTitle");
  const message = get("message");

  if (!eventId || !eventTitle) return { error: "잘못된 요청입니다." };
  if (!message) return { error: "신고 내용을 입력하세요." };

  await createIssue({
    eventId,
    eventTitle,
    message,
    reporterContact: get("reporterContact") || null,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/issues");
  return { ok: true };
}

// 관리자: 신고 처리 완료
export async function resolveIssueAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAuth();
  const ok = await setIssueStatus(id, "resolved");
  if (!ok) return { error: "신고를 찾을 수 없습니다." };
  revalidatePath("/admin");
  revalidatePath("/admin/issues");
  return {};
}

// 관리자: 신고 삭제
export async function deleteIssueAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAuth();
  const ok = await deleteIssue(id);
  if (!ok) return { error: "신고를 찾을 수 없습니다." };
  revalidatePath("/admin");
  revalidatePath("/admin/issues");
  return {};
}
