"use client";
import React from "react";

export function CopyButton({ value, className, title }: { value: string; className?: string; title?: string }) {
  return (
    <button
      type="button"
      className={className}
      title={title}
      onClick={() => navigator.clipboard.writeText(value)}
    >
      <span role="img" aria-label="Copy">📋</span>
    </button>
  );
}
