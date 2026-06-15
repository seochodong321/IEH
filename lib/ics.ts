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

// RFC 5545 §3.1: 콘텐츠 라인은 75옥텟 이하로 접는다(이어지는 줄은 공백 1칸으로 시작).
// 옥텟(UTF-8 바이트) 기준으로 자르되, 멀티바이트 문자는 코드포인트 단위로 순회해 쪼개지지 않게 한다.
function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const chunks: string[] = [];
  let cur = "";
  let curBytes = 0;
  for (const ch of line) {
    const chBytes = enc.encode(ch).length;
    // 첫 줄은 75옥텟, 이어지는 줄은 선행 공백 1칸 포함 75 → 콘텐츠 74옥텟
    const limit = chunks.length === 0 ? 75 : 74;
    if (curBytes + chBytes > limit) {
      chunks.push(cur);
      cur = ch;
      curBytes = chBytes;
    } else {
      cur += ch;
      curBytes += chBytes;
    }
  }
  if (cur) chunks.push(cur);
  return chunks.join("\r\n ");
}

function timeCompact(t: string): string {
  return t.replace(":", "") + "00"; // "14:00" → "140000"
}

function addOneHour(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const nh = (h + 1) % 24;
  return `${String(nh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
  ];

  const weekly = e.recurrenceType === "weekly";

  if (e.startTime) {
    // 시간 지정 일정 → DATE-TIME (Asia/Seoul). 종료시간 없으면 +1시간.
    const st = e.startTime;
    const et = e.endTime || addOneHour(st);
    const endBase = weekly ? start : e.endDate;
    lines.push(`DTSTART;TZID=Asia/Seoul:${dateOnly(start)}T${timeCompact(st)}`);
    lines.push(`DTEND;TZID=Asia/Seoul:${dateOnly(endBase)}T${timeCompact(et)}`);
  } else if (weekly) {
    // 종일 단일 occurrence
    lines.push(`DTSTART;VALUE=DATE:${dateOnly(start)}`);
    lines.push(`DTEND;VALUE=DATE:${dateOnly(addDays(start, 1))}`);
  } else {
    // 연속 종일 일정 (DTEND는 배타적이라 종료일+1)
    lines.push(`DTSTART;VALUE=DATE:${dateOnly(start)}`);
    lines.push(`DTEND;VALUE=DATE:${dateOnly(addDays(e.endDate, 1))}`);
  }

  if (weekly) {
    const days = [...e.recurrenceDays]
      .sort((a, b) => a - b)
      .map((d) => BYDAY[d])
      .join(",");
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${days};UNTIL=${dateOnly(e.endDate)}`);
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
  // URI 값이라 TEXT 이스케이프 대신 줄바꿈만 제거 (ICS 라인 주입 방지)
  if (e.websiteUrl) lines.push(`URL:${e.websiteUrl.replace(/[\r\n]/g, "")}`);

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
