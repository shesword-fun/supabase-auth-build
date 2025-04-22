"use client";
import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ImageGalleryProps = {
  images: string[];
  altPrefix?: string;
};



export function ImageGallery({ images, altPrefix = "Gallery image" }: ImageGalleryProps) {
  // images is now always an array of public URLs
  const [heroIdx, setHeroIdx] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const heroImg = images?.[heroIdx] || "";

  const showPrev = () => setHeroIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const showNext = () => setHeroIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  React.useEffect(() => {
    if (heroIdx >= images.length) setHeroIdx(0);
  }, [images, heroIdx]);

  if (!images?.length) return (
    <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-lg italic min-h-[280px]">No images</div>
  );

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Hero Image */}
      <div className="relative group aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-lg border">
        <button
          aria-label="Previous image"
          onClick={showPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/40 hover:bg-white hover:scale-105 transition rounded-full p-2 z-10 shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button
          aria-label="Next image"
          onClick={showNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/40 hover:bg-white hover:scale-105 transition rounded-full p-2 z-10 shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <Image
          src={heroImg}
          alt={`${altPrefix} ${heroIdx + 1}`}
          fill
          className="object-cover transition-all duration-300 group-hover:scale-105 cursor-pointer"
          onClick={() => setModalOpen(true)}
          priority
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>
      {/* Thumbnails */}
      <div className="flex gap-2 justify-center mt-1 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={img + i}
            className={cn(
              "rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none",
              i === heroIdx
                ? "border-primary ring-2 ring-primary/60"
                : "border-transparent hover:border-primary/40"
            )}
            style={{ width: 68, height: 68 }}
            aria-label={`Show image ${i + 1}`}
            onClick={() => setHeroIdx(i)}
          >
            <Image
              src={img}
              alt={`${altPrefix} thumbnail ${i + 1}`}
              width={68}
              height={68}
              className={cn(
                "object-cover w-full h-full transition-all",
                i === heroIdx ? "scale-105" : "opacity-80 hover:opacity-100"
              )}
            />
          </button>
        ))}
      </div>
      {/* Modal for full-size image */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl p-6 bg-transparent border-none shadow-2xl flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[3/4] max-h-[90vh] flex items-center justify-center">
            <Image
              src={heroImg}
              alt={`${altPrefix} full size ${heroIdx + 1}`}
              fill
              className="object-cover rounded-xl bg-black shadow-2xl border-4 border-white dark:border-gray-800"
              priority
              sizes="80vw"
            />
            {/* Arrows in modal */}
            <button
              aria-label="Previous image"
              onClick={() => setHeroIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/40 hover:bg-white hover:scale-105 transition rounded-full p-2 z-10 shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              aria-label="Next image"
              onClick={() => setHeroIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/40 hover:bg-white hover:scale-105 transition rounded-full p-2 z-10 shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
