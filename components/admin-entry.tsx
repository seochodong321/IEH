"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

// 일반 사용자 눈에 잘 띄지 않도록 우측 하단에 흐리게 배치한 관리자 진입점.
// (호버 시에만 또렷해진다.) 관리자 화면에서는 숨긴다.
export function AdminEntry() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <Link
      href="/admin"
      aria-label="관리자 모드"
      title="관리자 모드"
      className="fixed right-4 bottom-4 z-30 flex size-9 items-center justify-center rounded-full bg-slate-900/10 text-slate-400 opacity-40 backdrop-blur-sm transition hover:bg-slate-900 hover:text-white hover:opacity-100"
    >
      <Settings className="size-4" />
    </Link>
  );
}
