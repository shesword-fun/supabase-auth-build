"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Image from 'next/image';

export function EditProfileForm({
  userId,
  initialLocation,
  initialSlug,
  initialProfileImageUrl,
}: {
  userId: string;
  initialLocation: string;
  initialSlug: string;
  initialProfileImageUrl?: string;
}) {
  const [location, setLocation] = useState(initialLocation || "");
  const [slug, setSlug] = useState(initialSlug || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState(initialProfileImageUrl || "");
  const router = useRouter();

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImage(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    let uploadedImageUrl = profileImageUrl;

    // Upload image if selected
    if (profileImage) {
      const ext = profileImage.name.split('.').pop();
      const filePath = `${userId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, profileImage, { upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);
      uploadedImageUrl = publicUrlData?.publicUrl || "";
      setProfileImageUrl(uploadedImageUrl);
    }

    const { error } = await supabase
      .from("users")
      .update({ location, slug, profile_image_url: uploadedImageUrl })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setError("Failed to update profile");
    } else {
      router.push(`/${location}/${slug}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label>
        <span className="font-semibold">Location</span>
        <input
          className="border rounded px-2 py-1 w-full mt-1"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </label>
      <label>
        <span className="font-semibold">Slug</span>
        <input
          className="border rounded px-2 py-1 w-full mt-1"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </label>
      <label>
        <span className="font-semibold">Profile Image</span>
        <input
          className="border rounded px-2 py-1 w-full mt-1"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </label>
      {profileImageUrl && (
        <Image
          src={profileImageUrl}
          alt="Profile Image"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover mb-2"
        />
      )}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        type="submit"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}