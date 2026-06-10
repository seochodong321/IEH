import { Lock } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : "/admin";

  return (
    <div className="mx-auto max-w-sm pt-10 sm:pt-16">
      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-muted">
          <Lock className="size-5" />
        </div>
        <h1 className="text-xl font-semibold">관리자 로그인</h1>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          행사 등록·수정·삭제는 관리자만 가능합니다.
        </p>
        <LoginForm from={from} />
      </div>
    </div>
  );
}
