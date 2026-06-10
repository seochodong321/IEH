import { addDays, weekdayOf } from "@/lib/event-utils";
import { DISTRICT_MAP } from "@/lib/constants";
import type { EventRecord } from "@/lib/types";

// 행사 1건을 iCalendar(.ics) 텍스트로 변환. 시간 정보가 없으므로 종일(VALUE=DATE)로 처리.
// 매주 반복은 RRULE(FREQ=WEEKLY;BYDAY=...;UNTIL=종료일)로 표현.

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function esc(s: string): string {
  return (s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function dateOnly(d: string): string {
  return d.replace(/-/g, "");
}

// 매주 반복이면 시작일 이후 첫 발생일을 DTSTART로 사용
function firstOccurrence(e: EventRecord): string {
  if (e.recurrenceType !== "weekly") return e.startDate;
  let d = e.startDate;
  for (let i = 0; i < 7 && d <= e.endDate; i++) {
    if (e.recurrenceDays.includes(weekdayOf(d))) return d;
    d = addDays(d, 1);
  }
  return e.startDate;
}

export function eventToICS(e: EventRecord): string {
  const start = firstOccurrence(e);
  const dtstamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "Z");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Incheon Event Radar//KR//",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@incheon-event-radar`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${esc(e.title)}`,
    `DTSTART;VALUE=DATE:${dateOnly(start)}`,
  ];

  if (e.recurrenceType === "weekly") {
    // 종일 단일 occurrence + 매주 반복
    lines.push(`DTEND;VALUE=DATE:${dateOnly(addDays(start, 1))}`);
    const days = [...e.recurrenceDays]
      .sort((a, b) => a - b)
      .map((d) => BYDAY[d])
      .join(",");
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${days};UNTIL=${dateOnly(e.endDate)}`);
  } else {
    // 연속 종일 일정 (DTEND는 배타적이라 종료일+1)
    lines.push(`DTEND;VALUE=DATE:${dateOnly(addDays(e.endDate, 1))}`);
  }

  lines.push(`LOCATION:${esc(`${DISTRICT_MAP[e.district].label} · ${e.venue}`)}`);

  const descParts = [
    e.description,
    e.organizer ? `주최: ${e.organizer}` : "",
    e.host ? `주관: ${e.host}` : "",
  ].filter(Boolean);
  if (descParts.length) {
    lines.push(`DESCRIPTION:${esc(descParts.join("\n"))}`);
  }
  if (e.websiteUrl) lines.push(`URL:${e.websiteUrl}`);

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
