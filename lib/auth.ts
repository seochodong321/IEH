import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { SESSION_COOKIE } from "@/lib/session";

export { SESSION_COOKIE };
const SALT = "incheon-event-radar::v1";

/**
 * 관리자 비밀번호. 운영 환경에서는 반드시 ADMIN_PASSWORD 환경변수를 설정해야 한다.
 * 운영에서 미설정이면 인증을 거부한다 — 공개된 기본값으로 배포되는 사고 방지.
 * 로컬 개발에서만 기본값을 사용한다(README 참고).
 */
export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (password) return password;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_PASSWORD 환경변수가 설정되지 않았습니다. 운영 환경에서는 필수입니다.",
    );
  }
  return "admin1234";
}

/**
 * 비밀번호로부터 파생한 세션 토큰(원문 비밀번호를 쿠키에 담지 않기 위함).
 * SESSION_SECRET 설정 시 HMAC 키로 사용되어, 저장소에 있는 SALT만으로는
 * 토큰을 재계산할 수 없게 된다. 운영 환경에서 설정 권장.
 */
export function sessionToken(): string {
  const secret = process.env.SESSION_SECRET || SALT;
  return createHmac("sha256", secret).update(getAdminPassword()).digest("hex");
}

/** 비밀 값 비교 — 길이가 달라도 일정 시간이 걸리도록 양쪽을 해시한 뒤 비교한다. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return !!value && safeEqual(value, sessionToken());
}

/** 보호된 서버 컴포넌트/액션 진입점에서 호출 — 미인증 시 로그인으로 보낸다. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}
