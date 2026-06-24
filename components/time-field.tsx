"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/form-field";

// 시간 입력을 네이티브 type=time(스테퍼) 대신 시·분 드롭다운으로.
const NONE = "none";
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
); // 00,05,...,55

const HOUR_ITEMS: Record<string, string> = {
  [NONE]: "미정",
  ...Object.fromEntries(HOURS.map((h) => [h, `${h}시`])),
};
const MINUTE_ITEMS: Record<string, string> = Object.fromEntries(
  MINUTES.map((m) => [m, `${m}분`]),
);

// 시·분 공용 드롭다운 (Select 보일러플레이트 1곳)
function TimeSelect({
  items,
  value,
  disabled,
  onChange,
}: {
  items: Record<string, string>;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      items={items}
      value={value}
      disabled={disabled}
      onValueChange={(v) => onChange(String(v))}
    >
      <SelectTrigger className="h-9 flex-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TimeField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  /** "HH:MM" 또는 빈 문자열(시간 미정) */
  value: string;
  onChange: (value: string) => void;
}) {
  const [h, m] = value ? value.split(":") : ["", "00"];
  const hasHour = h !== "";
  // AI 등록 등으로 5분 단위가 아닌 분(예: 23)이 들어와도 표시되도록 보강
  const minuteItems =
    m && !MINUTES.includes(m) ? { ...MINUTE_ITEMS, [m]: `${m}분` } : MINUTE_ITEMS;

  return (
    <Field label={label}>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-2">
        <TimeSelect
          items={HOUR_ITEMS}
          value={hasHour ? h : NONE}
          onChange={(hh) => onChange(hh === NONE ? "" : `${hh}:${m || "00"}`)}
        />
        <TimeSelect
          items={minuteItems}
          value={m || "00"}
          disabled={!hasHour}
          onChange={(mm) => {
            if (hasHour) onChange(`${h}:${mm}`);
          }}
        />
      </div>
    </Field>
  );
}
