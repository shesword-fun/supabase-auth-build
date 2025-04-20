"use client";

import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";

export type BatchUploadStatus = {
  step: string;
  message: string;
  type: "info" | "success" | "error";
};

export function BatchUploadConsole() {
  const [status, setStatus] = useState<BatchUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus([]);
    setIsUploading(true);
    try {
      setStatus((prev) => [...prev, { step: "read", message: `Reading manifest: ${file.name}`, type: "info" }]);
      const text = await file.text();
      const manifest = JSON.parse(text);
      setStatus((prev) => [...prev, { step: "parse", message: `Parsed manifest with ${manifest.items.length} merchants.`, type: "success" }]);
      setStatus((prev) => [...prev, { step: "upload", message: `Uploading to server...`, type: "info" }]);
      const res = await fetch('/api/admin/batch-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      });
      const result = await res.json();
      if (result.status === 'done') {
        setStatus((prev) => [...prev, { step: "done", message: `Batch upload complete: ${result.results.length} merchants processed.`, type: "success" }]);
        // Optionally, show per-merchant results here
      } else {
        setStatus((prev) => [...prev, { step: "error", message: result.error || 'Unknown error', type: "error" }]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus((prev) => [...prev, { step: "error", message: err.message, type: "error" }]);
      } else {
        setStatus((prev) => [...prev, { step: "error", message: 'Unknown error', type: "error" }]);
      }
    }
    setIsUploading(false);
  };

  return (
    <Card className="p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Batch Merchant Upload</h2>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="mb-4"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <div className="flex flex-col gap-2 mt-4">
        {status.map((s, i) => (
          <div
            key={i}
            className={`text-sm rounded p-2 ${
              s.type === "error"
                ? "bg-red-100 text-red-700"
                : s.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <b>{s.step}:</b> {s.message}
          </div>
        ))}
      </div>
    </Card>
  );
}
