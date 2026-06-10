import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileNav, Sidebar } from "@/components/sidebar";
import { AdminEntry } from "@/components/admin-entry";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "인천 행사 상황판",
  description:
    "인천에서 열리는 행사·축제·공연·박람회·체육행사를 한눈에 확인하는 상황판",
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
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileNav />
            <main className="flex-1 px-4 py-6 md:px-8">
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
