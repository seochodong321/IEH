import { getImage } from "@/lib/data/images";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 업로드 이미지 서빙. id가 불변(업로드마다 새 id)이라 장기 캐시가 안전하다.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // UUID 형식이 아니면 DB까지 가지 않는다 (Postgres uuid 캐스트 오류 → 500 방지)
  if (!UUID_RE.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  const img = await getImage(id);
  if (!img) {
    return new Response("Not found", { status: 404 });
  }
  const bytes = Buffer.from(img.data, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": img.mimeType,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
