"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

export function EditProfileForm({
  userId,
  initialLocation,
  initialSlug,
}: {
  userId: string;
  initialLocation: string;
  initialSlug: string;
}) {
  const [location, setLocation] = useState(initialLocation || "");
  const [slug, setSlug] = useState(initialSlug || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ location, slug })
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