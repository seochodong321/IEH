"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { submitReport, type ReportState } from "@/actions/submissions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, DISTRICTS, labelRecord } from "@/lib/constants";

const categoryItems = { none: "미정 / 모름", ...labelRecord(CATEGORIES) };
const districtItems = { none: "미정 / 모름", ...labelRecord(DISTRICTS) };

export function ReportForm() {
  const [state, formAction, pending] = useActionState<ReportState, FormData>(
    submitReport,
    {},
  );
  const [category, setCategory] = useState("none");
  const [district, setDistrict] = useState("none");

  if (state.ok) {
    return (
      <div className="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
        <CheckCircle2 className="mx-auto size-10 text-green-600" />
        <h2 className="mt-3 text-lg font-semibold">제보 감사합니다!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          담당자가 내용을 검토한 뒤 게시 여부를 결정합니다. 검토 전에는 공개되지
          않습니다.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            대시보드로
          </Link>
          <a
            href="/report"
            className="rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-foreground/15 hover:bg-muted"
          >
            다른 행사 제보
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10"
    >
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="district" value={district} />

      <Field label="행사명" htmlFor="title" required>
        <Input id="title" name="title" placeholder="예: 송도 가을 음악회" required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="행사유형">
          <Select items={categoryItems} value={category} onValueChange={(v) => setCategory(String(v))}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">미정 / 모름</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="권역">
          <Select items={districtItems} value={district} onValueChange={(v) => setDistrict(String(v))}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">미정 / 모름</SelectItem>
              {DISTRICTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="시작일" htmlFor="startDate">
          <Input id="startDate" name="startDate" type="date" />
        </Field>
        <Field label="종료일" htmlFor="endDate">
          <Input id="endDate" name="endDate" type="date" />
        </Field>
      </div>

      <Field label="장소" htmlFor="venue">
        <Input id="venue" name="venue" placeholder="예: 송도컨벤시아" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="주최" htmlFor="organizer">
          <Input id="organizer" name="organizer" />
        </Field>
        <Field label="주관" htmlFor="host">
          <Input id="host" name="host" />
        </Field>
      </div>

      <Field label="행사 설명 / 참고 사항" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="알고 있는 내용을 자유롭게 적어주세요. 정확하지 않아도 괜찮습니다."
        />
      </Field>

      <Field label="홈페이지 / 출처 링크" htmlFor="websiteUrl">
        <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="제보자 이름 (선택)" htmlFor="reporterName">
          <Input id="reporterName" name="reporterName" />
        </Field>
        <Field label="제보자 연락처 (선택)" htmlFor="reporterContact">
          <Input
            id="reporterContact"
            name="reporterContact"
            placeholder="이메일 또는 전화번호"
          />
        </Field>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "제출 중..." : "제보하기"}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
