import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// /admin 이하를 보호한다(로그인 페이지 제외). 쿠키 "존재" 여부만 빠르게 검사하고,
// 실제 토큰 검증은 각 페이지/액션의 requireAuth()에서 수행한다(Edge에서 crypto 회피).
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!req.cookies.has(SESSION_COOKIE)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
