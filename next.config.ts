import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 대표 이미지 업로드(서버 액션) 본문 한도. 기본 1MB → 8MB
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
