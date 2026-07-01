import { isAuthenticated } from "@/lib/auth";
import { createImage } from "@/lib/data/images";

export const dynamic = "force-dynamic";

// 이미지 업로드(관리자 전용). 게시물 본문에 붙여넣기한 이미지를 저장하고 서빙 URL 반환.
// SVG 제외 래스터만 허용, 4MB 제한. 저장은 기존 images 테이블(base64) 재사용.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "이미지 파일이 없습니다." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return Response.json(
      { error: "PNG·JPEG·WebP·GIF 이미지만 가능합니다." },
      { status: 400 },
    );
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MAX_BYTES) {
    return Response.json(
      { error: "이미지는 4MB 이하만 가능합니다." },
      { status: 400 },
    );
  }
  const id = await createImage(file.type, bytes.toString("base64"));
  return Response.json({ url: `/api/images/${id}` });
}
