import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  Home,
  MapPin,
  Paperclip,
  Phone,
  Repeat,
  Star,
  Users,
} from "lucide-react";
import {
  CategoryBadge,
  OrgTypeBadge,
  StatusBadge,
} from "@/components/event-badges";
import { EventThumb } from "@/components/event-thumb";
import { LinkifiedText } from "@/components/linkified-text";
import { ImageLightbox } from "@/components/image-lightbox";
import { RelatedNews } from "@/components/related-news";
import { ShareButton } from "@/components/share-button";
import { LikeButton } from "@/components/like-button";
import { ReportIssueButton } from "@/components/report-issue-button";
import { cn } from "@/lib/utils";
import { isAuthenticated } from "@/lib/auth";
import { getEventById } from "@/lib/data/events";
import { INDOOR_OUTDOOR_MAP, districtLabel } from "@/lib/constants";
import { formatDate, formatDateRange, recurrenceLabel } from "@/lib/event-utils";

export const dynamic = "force-dynamic";

// 공개 상세에서 볼 수 있는 행사만 반환 — 대기(미게시)는 관리자(로그인)만.
// 메타데이터와 본문이 같은 가시성 규칙을 공유하도록 한 곳에 모은다.
// (getEventById는 React.cache라 두 번 호출해도 쿼리는 1회)
async function getViewableEvent(id: string) {
  const event = await getEventById(id);
  if (!event) return null;
  if (!event.published && !(await isAuthenticated())) return null;
  return event;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getViewableEvent(id);
  if (!event) return { title: "행사를 찾을 수 없습니다" };
  const where = `${districtLabel(event.district)} · ${event.venue}`;
  const description = `${formatDateRange(event.startDate, event.endDate)} · ${where}`;
  return {
    title: event.title,
    description,
    openGraph: {
      type: "article",
      title: event.title,
      description,
      // 대표 이미지가 없으면 사이트 공용 OG 이미지로 (카톡 등 공유 썸네일)
      images: [event.imageUrl ?? "/og.png"],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getViewableEvent(id);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {!event.published ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          이 행사는 아직 <b>대기(미게시)</b> 상태입니다 — 관리자만 볼 수 있어요.
          관리 화면에서 “승인”하면 공개됩니다.
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
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
          <ReportIssueButton eventId={event.id} eventTitle={event.title} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {/* 상단은 카테고리 색 헤더 (포스터는 아래 '행사 설명' 옆에 전체로 표시) */}
        <EventThumb
          category={event.category}
          className="h-28 w-full"
          iconClassName="size-10"
        />
        <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge value={event.category} />
          <OrgTypeBadge value={event.orgType} />
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
          {event.startTime
            ? ` · ${event.startTime}${event.endTime ? `~${event.endTime}` : ""}`
            : ""}
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <InfoRow icon={CalendarDays} label="시작일" value={formatDate(event.startDate)} />
          <InfoRow icon={CalendarDays} label="종료일" value={formatDate(event.endDate)} />
          <InfoRow icon={MapPin} label="장소" value={event.venue} />
          <InfoRow icon={MapPin} label="권역" value={districtLabel(event.district)} />
          {event.startTime ? (
            <InfoRow
              icon={Clock}
              label="시간"
              value={`${event.startTime}${event.endTime ? ` ~ ${event.endTime}` : ""}`}
            />
          ) : null}
          <InfoRow icon={Building2} label="주최" value={event.organizer} />
          <InfoRow icon={Users} label="주관" value={event.host} />
          {event.contact ? (
            <InfoRow icon={Phone} label="문의" value={event.contact} />
          ) : null}
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

      {event.description || event.imageUrl ? (
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div
            className={cn(
              "grid items-start gap-6",
              event.description && event.imageUrl && "md:grid-cols-2",
            )}
          >
            {event.description ? (
              <div className="min-w-0">
                <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                  행사 설명
                </h2>
                <LinkifiedText
                  text={event.description}
                  className="leading-relaxed break-words whitespace-pre-wrap"
                />
              </div>
            ) : null}
            {event.imageUrl ? (
              <div className="min-w-0">
                <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                  관련 이미지
                </h2>
                <ImageLightbox
                  src={event.imageUrl}
                  alt={`${event.title} 관련 이미지`}
                />
              </div>
            ) : null}
          </div>
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

      {event.published ? (
        <Suspense fallback={null}>
          <RelatedNews query={event.title} />
        </Suspense>
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
