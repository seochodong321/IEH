import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** DB 드라이버에 따라 Date 또는 string 으로 오는 timestamp 를 ISO 문자열로 통일 */
export function toIso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value)
}
