import { useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MerchantVideoManagerProps {
  merchantSlug: string;
  initialVideoUrl?: string | null;
  onVideoChange?: (url: string | null) => void;
}

export function MerchantVideoManager({
  merchantSlug,
  initialVideoUrl,
  onVideoChange,
}: MerchantVideoManagerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const bucket = "merchants";
  const folder = `public/${merchantSlug}/video/`;

  // Upload video
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const file = e.target.files[0];
    const path = `${folder}${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(path).data;
      setVideoUrl(publicUrl);
      onVideoChange?.(publicUrl);
    } else {
      alert("Upload failed: " + error.message);
    }
    setUploading(false);
  };

  // Delete video
  const handleDelete = async () => {
    if (!videoUrl) return;
    setDeleting(true);
    const match = videoUrl.match(/\/object\/public\/(.*)/);
    const storageKey = match ? match[1] : "";
    if (!storageKey) {
      setDeleting(false);
      return;
    }
    const { error } = await supabase.storage.from(bucket).remove([storageKey]);
    setDeleting(false);
    if (!error) {
      setVideoUrl(null);
      onVideoChange?.(null);
    }
  };

  return (
    <div className="mb-6">
      <label className="font-semibold block mb-2">Video</label>
      <div className="flex gap-3 mb-2">
        {videoUrl ? (
          <div className="relative w-48 h-32 border rounded overflow-hidden bg-gray-50 flex items-center justify-center">
            <video src={videoUrl} controls className="w-full h-full object-cover rounded" />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1 opacity-80 hover:opacity-100"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete video"
            >
              ×
            </Button>
          </div>
        ) : (
          <span className="text-gray-400 italic text-sm">No video uploaded.</span>
        )}
      </div>
      <Input
        type="file"
        accept="video/*"
        onChange={handleUpload}
        disabled={uploading}
        className="mb-2"
      />
      {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
    </div>
  );
}
