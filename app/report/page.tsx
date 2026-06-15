import { ReportForm } from "@/components/report-form";

export const metadata = {
  title: "행사 제보하기",
  description: "인천에서 열리는 행사·축제 정보를 제보해 주세요. 검토 후 게시됩니다.",
};

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">행사 제보하기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          알고 계신 인천 행사·축제를 제보해 주세요. 제보 내용은{" "}
          <span className="font-medium text-foreground">관리자 검토 후</span>{" "}
          게시되며, 제보 즉시 공개되지는 않습니다. 정보가 일부만 있어도
          괜찮습니다.
        </p>
      </div>
      <ReportForm />
    </div>
  );
}
