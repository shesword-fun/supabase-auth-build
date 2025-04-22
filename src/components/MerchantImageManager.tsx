import { useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface MerchantImageManagerProps {
  merchantSlug: string;
  initialImages: string[];
  initialMainImage?: string;
  onImagesChange?: (images: string[]) => void;
  onMainImageChange?: (mainImage: string | null) => void;
}

export function MerchantImageManager({
  merchantSlug,
  initialImages,
  initialMainImage,
  onImagesChange,
  onMainImageChange,
}: MerchantImageManagerProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [mainImage, setMainImage] = useState<string | null>(initialMainImage || null);
  const [uploading, setUploading] = useState(false);
  const [mainUploading, setMainUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [mainDeleting, setMainDeleting] = useState(false);
  const supabase = createClient();
  const bucket = "merchants";
  const galleryFolder = `public/${merchantSlug}/images/`;
  const mainImageFolder = `public/${merchantSlug}/main-image/`;

  // Gallery image upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const newImages: string[] = [];
    for (const file of Array.from(e.target.files)) {
      const path = `${galleryFolder}${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (!error) {
        const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(path).data;
        if (publicUrl) newImages.push(publicUrl);
      }
    }
    setUploading(false);
    if (newImages.length > 0) {
      const updated = [...images, ...newImages];
      setImages(updated);
      onImagesChange?.(updated);
    }
  };

  // Gallery image delete
  const handleDelete = async (imgUrl: string) => {
    setDeleting(imgUrl);
    // Extract storage key from public URL
    const match = imgUrl.match(/\/object\/public\/(.*)/);
    const storageKey = match ? match[1] : "";
    if (!storageKey) {
      setDeleting(null);
      return;
    }
    const { error } = await supabase.storage.from(bucket).remove([storageKey]);
    setDeleting(null);
    if (!error) {
      const updated = images.filter((img) => img !== imgUrl);
      setImages(updated);
      onImagesChange?.(updated);
    }
  };

  // Main image upload
  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setMainUploading(true);
    const file = e.target.files[0];
    const path = `${mainImageFolder}${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (!error) {
      const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(path).data;
      setMainImage(publicUrl);
      onMainImageChange?.(publicUrl);
    } else {
      alert("Upload failed: " + error.message);
    }
    setMainUploading(false);
  };

  // Main image delete
  const handleMainDelete = async () => {
    if (!mainImage) return;
    setMainDeleting(true);
    const match = mainImage.match(/\/object\/public\/(.*)/);
    const storageKey = match ? match[1] : "";
    if (!storageKey) {
      setMainDeleting(false);
      return;
    }
    const { error } = await supabase.storage.from(bucket).remove([storageKey]);
    setMainDeleting(false);
    if (!error) {
      setMainImage(null);
      onMainImageChange?.(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label className="font-semibold block mb-2">Gallery Images</label>
        <div className="flex gap-3 flex-wrap mb-2">
          {images.length > 0 ? (
            images.map((img, i) => (
              <div key={img} className="relative w-20 h-20 border rounded overflow-hidden bg-gray-50 flex items-center justify-center group">
                <Image
                  src={img}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className="object-cover"
                  style={{ borderRadius: 6 }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-80 group-hover:opacity-100"
                  onClick={() => handleDelete(img)}
                  disabled={deleting === img}
                  title="Delete image"
                >
                  ×
                </Button>
              </div>
            ))
          ) : (
            <span className="text-gray-400 italic text-sm">No images uploaded.</span>
          )}
        </div>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="mb-2"
        />
        {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
      </div>
      <div className="mb-6">
        <label className="font-semibold block mb-2">Main Image</label>
        <div className="flex gap-3 mb-2">
          {mainImage ? (
            <div className="relative w-28 h-28 border rounded overflow-hidden bg-gray-50 flex items-center justify-center">
              <Image
                src={mainImage}
                alt="Main image"
                fill
                className="object-cover"
                style={{ borderRadius: 6 }}
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 opacity-80 hover:opacity-100"
                onClick={handleMainDelete}
                disabled={mainDeleting}
                title="Delete main image"
              >
                ×
              </Button>
            </div>
          ) : (
            <span className="text-gray-400 italic text-sm">No main image uploaded.</span>
          )}
        </div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleMainUpload}
          disabled={mainUploading}
          className="mb-2"
        />
        {mainUploading && <span className="text-xs text-gray-500">Uploading...</span>}
      </div>
    </div>
  );
}
