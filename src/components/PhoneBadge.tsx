"use client";
import * as React from "react";

export function PhoneBadge({ phone }: { phone: string }) {
  return (
    <span className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-base font-bold gap-2 shadow border border-primary/70">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.46l.48 1.7a2 2 0 01-.45 1.94l-.7.7a16.06 16.06 0 006.36 6.36l.7-.7a2 2 0 011.94-.45l1.7.48A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 5V4a2 2 0 012-2h1z" /></svg>
      <span className="font-semibold">{phone}</span>
      <button
        type="button"
        className="ml-2 px-2 py-1 rounded bg-white/30 text-xs hover:bg-white/50 border border-white/20"
        onClick={() => navigator.clipboard.writeText(phone)}
        title="Copy to clipboard"
      >📋</button>
    </span>
  );
}
