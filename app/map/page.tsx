import { MapExplorer } from "@/components/map-explorer";
import { getAllEvents } from "@/lib/data/events";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const events = await getAllEvents();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">지도 보기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          인천 2군 9구 권역별 행사 분포 · 권역을 클릭하면 해당 권역 행사를
          확인할 수 있어요.
        </p>
      </div>
      <MapExplorer events={events} />
    </div>
  );
}
