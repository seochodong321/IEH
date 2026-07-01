"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  LayoutGrid,
  ListChecks,
  Landmark,
  MapPin,
  Megaphone,
  Menu,
  Newspaper,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/", label: "대시보드", icon: LayoutGrid },
  { href: "/events", label: "행사 목록", icon: ListChecks },
  { href: "/calendar", label: "캘린더", icon: CalendarDays },
  { href: "/posts", label: "새소식", icon: Newspaper },
  { href: "/report", label: "제보하기", icon: Megaphone },
  { href: "/map", label: "지도 보기", icon: MapPin },
  { href: "/stats", label: "통계 현황", icon: BarChart3 },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600/90 text-white">
        <Landmark className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">
          인천 행사·축제 통합 현황판
        </span>
        <span className="block text-[11px] text-slate-400">
          Incheon Event Radar
        </span>
      </span>
    </Link>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(pathname, href)
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <a
      href="https://www.incheon.go.kr/"
      target="_blank"
      rel="noopener noreferrer"
      title="인천광역시 공식 홈페이지 (새 창)"
      className="flex items-center justify-center rounded-xl bg-white p-3 ring-1 ring-white/10 transition-opacity hover:opacity-90"
    >
      {/* 인천광역시 공식 CI — 짙은 워드마크라 흰 배경 카드 위에 표시 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/incheon-logo.png"
        alt="인천광역시"
        width={273}
        height={60}
        className="h-8 w-auto"
      />
    </a>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 bg-slate-900 p-4 md:flex">
      <Logo />
      <NavLinks pathname={pathname} />
      <div className="mt-auto">
        <Footer />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 드로어 열려 있을 때: 뒤 배경 스크롤 잠금 + Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-slate-900 md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Landmark className="size-5 text-blue-400" />
            <span className="text-sm font-semibold">인천 행사 상황판</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={open}
            className="-mr-2 rounded-md p-2 text-slate-200 hover:bg-white/10"
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="메뉴"
            className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col gap-6 overflow-y-auto bg-slate-900 p-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-2">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                className="-mr-1 rounded-md p-2 text-slate-200 hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <Footer />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
