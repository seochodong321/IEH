"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * 서버 액션 실행 공통 패턴: 오류면 toast.error,
 * 성공이면 toast.success → (onSuccess) → router.refresh().
 */
export function useActionRunner() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (
    action: () => Promise<{ error?: string }>,
    okMessage: string,
    onSuccess?: () => void,
  ) =>
    startTransition(async () => {
      const res = await action();
      if (res?.error) toast.error(res.error);
      else {
        toast.success(okMessage);
        onSuccess?.();
        router.refresh();
      }
    });

  return { pending, run };
}
