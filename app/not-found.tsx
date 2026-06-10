import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-5xl font-semibold">404</p>
      <p className="text-muted-foreground">요청하신 페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        대시보드로 이동
      </Link>
    </div>
  );
}
