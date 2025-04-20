"use client";
import * as React from "react";

export function VideoPlayer({ src }: { src: string }) {
  if (!src) return null;
  return (
    <div className="w-full mt-2">
      <video controls className="w-full rounded-xl border shadow-lg aspect-video">
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
