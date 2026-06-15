"use client";

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

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(pathname, href)
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon className="size-[18px]" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <div className="rounded-xl bg-white/5 p-4 text-center ring-1 ring-white/10">
      <div className="mb-2 flex items-end justify-center gap-1 text-slate-500">
        <Landmark className="size-4" />
        <Landmark className="size-6" />
        <Landmark className="size-5" />
      </div>
      <p className="text-sm font-medium text-slate-300">인천광역시</p>
    </div>
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
  return (
    <header className="sticky top-0 z-30 border-b bg-slate-900 md:hidden">
      <div className="flex h-14 items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Landmark className="size-5 text-blue-400" />
          <span className="text-sm font-semibold">인천 행사 상황판</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                isActive(pathname, href)
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
