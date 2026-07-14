import { RefreshCw } from "lucide-react";

// 대시보드 상단 히어로 — 파비콘·OG와 같은 '인천 축제의 밤' 아이덴티티
// (밤하늘 그라디언트 + 인천대교 실루엣 + 폭죽 + 바다 물결).
export function DashboardHero({ lastUpdated }: { lastUpdated: string }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1e1b4b] via-[#1e3a8a] to-[#2563eb] px-6 py-7 text-white sm:px-8">
      {/* 야경 아트 (장식) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 560 190"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto opacity-90 max-sm:opacity-35"
      >
        {/* 금색 폭죽 */}
        <g stroke="#fbbf24" strokeWidth="4" strokeLinecap="round">
          <line x1="350" y1="43" x2="350" y2="21" />
          <line x1="350" y1="71" x2="350" y2="93" />
          <line x1="364" y1="57" x2="386" y2="57" />
          <line x1="336" y1="57" x2="314" y2="57" />
          <line x1="360" y1="47" x2="376" y2="31" />
          <line x1="340" y1="47" x2="324" y2="31" />
          <line x1="360" y1="67" x2="376" y2="83" />
          <line x1="340" y1="67" x2="324" y2="83" />
        </g>
        <circle cx="350" cy="57" r="5" fill="#fef3c7" />
        {/* 분홍 폭죽 */}
        <g stroke="#f9a8d4" strokeWidth="3" strokeLinecap="round">
          <line x1="463" y1="30" x2="463" y2="16" />
          <line x1="463" y1="48" x2="463" y2="62" />
          <line x1="472" y1="39" x2="486" y2="39" />
          <line x1="454" y1="39" x2="440" y2="39" />
          <line x1="470" y1="32" x2="480" y2="22" />
          <line x1="456" y1="46" x2="446" y2="56" />
          <line x1="470" y1="46" x2="480" y2="56" />
          <line x1="456" y1="32" x2="446" y2="22" />
        </g>
        <circle cx="463" cy="39" r="3.5" fill="#fce7f3" />
        {/* 인천대교 (사장교) */}
        <g stroke="#e0f2fe" strokeLinecap="round" fill="none">
          <g strokeWidth="1.5" opacity="0.8">
            <line x1="420" y1="72" x2="368" y2="150" />
            <line x1="420" y1="72" x2="392" y2="150" />
            <line x1="420" y1="72" x2="446" y2="150" />
            <line x1="420" y1="72" x2="472" y2="150" />
            <line x1="521" y1="72" x2="486" y2="150" />
            <line x1="521" y1="72" x2="504" y2="150" />
            <line x1="521" y1="72" x2="540" y2="150" />
            <line x1="521" y1="72" x2="558" y2="144" />
          </g>
          <line x1="420" y1="64" x2="420" y2="150" strokeWidth="5" />
          <line x1="521" y1="64" x2="521" y2="150" strokeWidth="5" />
          <line x1="300" y1="150" x2="560" y2="150" strokeWidth="5.5" />
        </g>
        {/* 바다 물결 */}
        <g strokeLinecap="round" fill="none">
          <path
            d="M310 168 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"
            stroke="#7dd3fc"
            strokeWidth="3.5"
          />
          <path
            d="M340 181 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"
            stroke="#38bdf8"
            strokeWidth="3"
            opacity="0.7"
          />
        </g>
      </svg>

      <div className="relative">
        <h1 className="text-2xl font-bold tracking-tight">
          인천의 모든 행사·축제를 한눈에!
        </h1>
        <p className="mt-1.5 text-sm text-blue-100/90">
          인천에서 열리는 행사·축제·공연을 한 곳에서 확인하세요.
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-blue-200/80">
          <RefreshCw className="size-3.5" aria-hidden="true" />
          최종 업데이트: {lastUpdated}
        </p>
      </div>
    </section>
  );
}
