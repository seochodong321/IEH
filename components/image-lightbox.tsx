"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 클릭하면 같은 화면에서 큰 이미지로 확대해 보는 라이트박스.
export function ImageLightbox({ src, alt }: { src: string; alt: string }) {
  return (
    <Dialog>
      <DialogTrigger
        className="block cursor-zoom-in"
        title="클릭하면 크게 보기"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="mx-auto max-h-[32rem] w-auto max-w-full rounded-lg object-contain ring-1 ring-foreground/10 transition-opacity hover:opacity-90"
        />
      </DialogTrigger>
      <DialogContent className="max-w-[min(92vw,72rem)] bg-transparent p-0 ring-0">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[88vh] w-full rounded-lg object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
