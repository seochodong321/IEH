import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ExternalLink,
  Home,
  MapPin,
  Paperclip,
  Repeat,
  Star,
  Users,
} from "lucide-react";
import { CategoryBadge, StatusBadge } from "@/components/event-badges";
import { EventThumb } from "@/components/event-thumb";
import { ShareButton } from "@/components/share-button";
import { LikeButton } from "@/components/like-button";
import { getEventById } from "@/lib/data/events";
import {
  DISTRICT_MAP,
  INDOOR_OUTDOOR_MAP,
} from "@/lib/constants";
import { formatDate, formatDateRange, recurrenceLabel } from "@/lib/event-utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "행사를 찾을 수 없습니다 · 인천 행사 상황판" };
  const where = `${DISTRICT_MAP[event.district].label} · ${event.venue}`;
  return {
    title: `${event.title} · 인천 행사 상황판`,
    description: `${formatDateRange(event.startDate, event.endDate)} · ${where}`,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          행사 목록으로
        </Link>
        <div className="flex items-center gap-2">
          <LikeButton eventId={event.id} initialLikes={event.likes} />
          <ShareButton />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <EventThumb
          category={event.category}
          imageUrl={event.imageUrl}
          className="h-40 w-full"
          iconClassName="size-12"
        />
        <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge value={event.category} />
          <StatusBadge startDate={event.startDate} endDate={event.endDate} />
          {event.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              주요 행사
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 text-2xl font-semibold">{event.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="size-4" />
          {formatDateRange(event.startDate, event.endDate)}
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <InfoRow icon={CalendarDays} label="시작일" value={formatDate(event.startDate)} />
          <InfoRow icon={CalendarDays} label="종료일" value={formatDate(event.endDate)} />
          <InfoRow icon={MapPin} label="장소" value={event.venue} />
          <InfoRow icon={MapPin} label="권역" value={DISTRICT_MAP[event.district].label} />
          <InfoRow icon={Building2} label="주최" value={event.organizer} />
          <InfoRow icon={Users} label="주관" value={event.host} />
          <InfoRow
            icon={Home}
            label="실내/실외"
            value={INDOOR_OUTDOOR_MAP[event.indoorOutdoor].label}
          />
          <InfoRow
            icon={Repeat}
            label="반복"
            value={recurrenceLabel(event) || "기간 내내 (연속)"}
          />
        </dl>
        </div>
      </div>

      {event.description ? (
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            행사 설명
          </h2>
          <p className="leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      ) : null}

      {event.websiteUrl || event.attachmentUrl ? (
        <div className="flex flex-wrap gap-3">
          {event.websiteUrl ? (
            <a
              href={event.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-medium ring-1 ring-foreground/10 transition-colors hover:bg-muted"
            >
              <ExternalLink className="size-4" />
              홈페이지 바로가기
            </a>
          ) : null}
          {event.attachmentUrl ? (
            <a
              href={event.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-medium ring-1 ring-foreground/10 transition-colors hover:bg-muted"
            >
              <Paperclip className="size-4" />
              첨부파일 보기
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  );
}
