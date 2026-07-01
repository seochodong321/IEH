import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileNav, Sidebar } from "@/components/sidebar";
import { AdminEntry } from "@/components/admin-entry";
import { Toaster } from "@/components/ui/sonner";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "인천에서 열리는 행사·축제·공연·박람회·체육행사를 한눈에 확인하세요.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  // 각 페이지는 title 문자열만 export 하면 "%s · 인천 행사 상황판" 으로 합쳐진다.
  title: {
    default: "인천 행사 상황판",
    template: "%s · 인천 행사 상황판",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "인천 행사 상황판",
    locale: "ko_KR",
    title: "인천 행사 상황판",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-muted/40">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
        >
          본문 바로가기
        </a>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileNav />
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 px-4 py-6 focus:outline-none md:px-8"
            >
              <div className="mx-auto w-full max-w-[1440px]">{children}</div>
            </main>
          </div>
        </div>
        <AdminEntry />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
