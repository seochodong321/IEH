"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, SelectField } from "@/components/form-field";
import {
  CATEGORIES,
  DISTRICTS,
  INDOOR_OUTDOOR,
  ORG_TYPES,
  RECURRENCE_OPTIONS,
  WEEKDAYS_KO,
  labelRecord,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FormState } from "@/actions/events";
import type {
  Category,
  District,
  EventRecord,
  IndoorOutdoor,
  OrgType,
  RecurrenceType,
} from "@/lib/types";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const categoryItems = labelRecord(CATEGORIES);
const districtItems = labelRecord(DISTRICTS);
const indoorItems = labelRecord(INDOOR_OUTDOOR);
const orgTypeItems = labelRecord(ORG_TYPES);
const recurrenceItems = Object.fromEntries(
  RECURRENCE_OPTIONS.map((o) => [o.value, o.label]),
);

export function EventForm({
  action,
  event,
  submitLabel,
  fromSubmissionId,
}: {
  action: Action;
  /** 기존 행사(수정) 또는 제보 프리필(등록)용 기본값 */
  event?: Partial<EventRecord>;
  submitLabel: string;
  /** 제보로부터 등록 시 해당 제보 id (등록되면 승인 처리) */
  fromSubmissionId?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  // Base UI Select 값을 확실히 전송하기 위해 controlled state + hidden input 사용
  const [category, setCategory] = useState<Category>(
    event?.category ?? "festival",
  );
  const [district, setDistrict] = useState<District>(
    event?.district ?? "jemulpo",
  );
  const [indoorOutdoor, setIndoorOutdoor] = useState<IndoorOutdoor>(
    event?.indoorOutdoor ?? "outdoor",
  );
  const [orgType, setOrgType] = useState<OrgType>(event?.orgType ?? "public");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    event?.recurrenceType ?? "none",
  );
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(
    event?.recurrenceDays ?? [],
  );
  const toggleDay = (d: number) =>
    setRecurrenceDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="recurrenceType" value={recurrenceType} />
      <input
        type="hidden"
        name="recurrenceDays"
        value={recurrenceDays.join(",")}
      />
      {fromSubmissionId ? (
        <input type="hidden" name="fromSubmission" value={fromSubmissionId} />
      ) : null}

      <Field label="행사명" htmlFor="title" required>
        <Input
          id="title"
          name="title"
          defaultValue={event?.title}
          placeholder="예: 2026 송도 마이크로 페스티벌"
          required
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="행사유형"
          name="category"
          required
          items={categoryItems}
          value={category}
          onChange={(v) => setCategory(v as Category)}
        />

        <SelectField
          label="권역"
          name="district"
          required
          items={districtItems}
          value={district}
          onChange={(v) => setDistrict(v as District)}
        />

        <Field label="시작일" htmlFor="startDate" required>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={event?.startDate}
            required
          />
        </Field>

        <Field label="종료일" htmlFor="endDate" required>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={event?.endDate}
            required
          />
        </Field>

        <Field label="시작 시간 (선택)" htmlFor="startTime">
          <Input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={event?.startTime ?? ""}
          />
        </Field>

        <Field label="종료 시간 (선택)" htmlFor="endTime">
          <Input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={event?.endTime ?? ""}
          />
        </Field>
      </div>

      <Field label="반복 설정" required>
        <div className="space-y-3">
          <Select
            items={recurrenceItems}
            value={recurrenceType}
            onValueChange={(v) => setRecurrenceType(String(v) as RecurrenceType)}
          >
            <SelectTrigger className="h-9 w-full sm:w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {recurrenceType === "weekly" ? (
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS_KO.map((w, i) => {
                const on = recurrenceDays.includes(i);
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "size-9 rounded-md border text-sm font-medium transition-colors",
                      on
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "hover:bg-muted",
                      i === 0 && !on && "text-red-500",
                      i === 6 && !on && "text-blue-500",
                    )}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {recurrenceType === "weekly"
              ? "운영 기간(시작일~종료일) 안에서 선택한 요일에만 진행됩니다. 예: 매주 수요일, 매주 주말."
              : "운영 기간 동안 매일 연속으로 진행됩니다."}
          </p>
        </div>
      </Field>

      <Field label="장소" htmlFor="venue" required>
        <Input
          id="venue"
          name="venue"
          defaultValue={event?.venue}
          placeholder="예: 송도센트럴파크 일원"
          required
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="주최 구분"
          name="orgType"
          required
          items={orgTypeItems}
          value={orgType}
          onChange={(v) => setOrgType(v as OrgType)}
        />

        <SelectField
          label="실내/실외"
          name="indoorOutdoor"
          required
          items={indoorItems}
          value={indoorOutdoor}
          onChange={(v) => setIndoorOutdoor(v as IndoorOutdoor)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="주최기관" htmlFor="organizer" required>
          <Input
            id="organizer"
            name="organizer"
            defaultValue={event?.organizer}
            required
          />
        </Field>

        <Field label="주관기관" htmlFor="host" required>
          <Input id="host" name="host" defaultValue={event?.host} required />
        </Field>
      </div>

      <Field label="문의 연락처 (선택)" htmlFor="contact">
        <Input
          id="contact"
          name="contact"
          defaultValue={event?.contact ?? ""}
          placeholder="전화번호 또는 이메일"
        />
      </Field>

      <Field label="행사 설명" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          defaultValue={event?.description}
          rows={4}
          placeholder="행사 내용을 간단히 설명하세요."
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="홈페이지 링크" htmlFor="websiteUrl">
          <Input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={event?.websiteUrl ?? ""}
            placeholder="https://"
          />
        </Field>

        <Field label="첨부파일 링크" htmlFor="attachmentUrl">
          <Input
            id="attachmentUrl"
            name="attachmentUrl"
            type="url"
            defaultValue={event?.attachmentUrl ?? ""}
            placeholder="https://"
          />
        </Field>
      </div>

      <Field label="대표 이미지 (선택)" htmlFor="imageFile">
        <input type="hidden" name="currentImageUrl" value={event?.imageUrl ?? ""} />
        {event?.imageUrl ? (
          <div className="mb-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.imageUrl}
              alt="현재 대표 이미지"
              className="h-16 w-24 rounded-md object-cover ring-1 ring-foreground/10"
            />
            <span className="text-xs text-muted-foreground">
              현재 이미지 · 새 파일을 올리면 교체됩니다
            </span>
          </div>
        ) : null}
        <input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="block w-full cursor-pointer text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/70"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          PNG·JPG·WebP·GIF 이미지 업로드. 비우면 카테고리 색 썸네일로 표시됩니다.
        </p>
      </Field>

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={event?.isFeatured ?? false}
          className="size-4 accent-blue-600"
        />
        주요 행사로 표시 (대시보드 상단·별표 노출)
      </label>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" render={<Link href="/admin" />}>
          취소
        </Button>
      </div>
    </form>
  );
}
