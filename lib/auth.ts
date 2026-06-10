import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { SESSION_COOKIE } from "@/lib/session";

export { SESSION_COOKIE };
const SALT = "incheon-event-radar::v1";

/**
 * 관리자 비밀번호. 운영 환경에서는 반드시 ADMIN_PASSWORD 환경변수를 설정해야 한다.
 * 미설정 시 로컬 개발용 기본값을 사용한다(README 참고).
 */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin1234";
}

/** 비밀번호로부터 파생한 세션 토큰(원문 비밀번호를 쿠키에 담지 않기 위함) */
export function sessionToken(): string {
  return createHash("sha256")
    .update(getAdminPassword() + SALT)
    .digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === sessionToken();
}

/** 보호된 서버 컴포넌트/액션 진입점에서 호출 — 미인증 시 로그인으로 보낸다. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}
