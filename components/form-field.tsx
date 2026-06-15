import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** 라벨(+필수 표시)과 입력을 묶는 공통 폼 필드 래퍼 */
export function Field({
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

/**
 * 라벨 + Base UI Select + hidden input 묶음.
 * Select 값이 폼 전송에 확실히 담기도록 controlled state + hidden input 패턴을 쓴다.
 * 선택지는 items(value→label) 순서대로 렌더된다.
 */
export function SelectField({
  label,
  name,
  required,
  items,
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  items: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} required={required}>
      <input type="hidden" name={name} value={value} />
      <Select
        items={items}
        value={value}
        onValueChange={(v) => onChange(String(v))}
      >
        <SelectTrigger className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(items).map(([v, itemLabel]) => (
            <SelectItem key={v} value={v}>
              {itemLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
