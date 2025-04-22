"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MerchantImageManager } from "@/components/MerchantImageManager";
import { MerchantVideoManager } from "@/components/MerchantVideoManager";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

// Accepts the full merchant object and admin/owner flags
interface Merchant {
  name: string;
  description?: string;
  about?: string;
  gender?: string;
  sexuality?: string;
  phone?: string;
  last_active?: string;
  slug: string;
  active?: boolean;
  location?: Record<string, unknown>;
  rates?: Record<string, unknown>;
  socialmedia?: Record<string, unknown>;
  resolvedsociallinks?: Record<string, unknown>;
  rating?: Record<string, unknown>;
  services?: string[];
  images?: string[];
  thumbnails?: string[];
  mainimage?: string;
  videourl?: string | null;
  id?: string;
}

export function EditProfileForm({
  merchant
}: {
  merchant: Merchant;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zod schema for validation
  const schema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    about: z.string().optional(),
    gender: z.string().optional(),
    sexuality: z.string().optional(),
    phone: z.string().optional(),
    last_active: z.string().optional(),
    slug: z.string().min(1),
    active: z.boolean().optional(),
    location: z.any(), // JSONB fields can be edited as JSON for now
    rates: z.any(),
    socialmedia: z.any(),
    resolvedsociallinks: z.any(),
    rating: z.any(),
    services: z.array(z.string()).optional().default([]),
    images: z.array(z.string()).optional(),
    thumbnails: z.array(z.string()).optional(),
    mainimage: z.string().optional(),
    videourl: z.string().nullable().optional(),
  });

  const { register, handleSubmit, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...merchant,
      services: merchant.services ?? [],
      location: JSON.stringify(merchant.location ?? {}, null, 2),
      rates: JSON.stringify(merchant.rates ?? {}, null, 2),
      socialmedia: JSON.stringify(merchant.socialmedia ?? {}, null, 2),
      resolvedsociallinks: JSON.stringify(merchant.resolvedsociallinks ?? {}, null, 2),
      rating: JSON.stringify(merchant.rating ?? {}, null, 2),
    }
  });
  console.log("EditProfileForm rendered");

  // ...rest of the component

  async function onSubmit(values: z.infer<typeof schema>) {
    console.log("onSubmit fired");
    console.log("onSubmit values:", values);
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const updateData = {
      ...values,
      images: values.images, // already updated by MerchantImageManager
      mainimage: values.mainimage, // already updated by MerchantImageManager
      location: safeParseJson(values.location),
      rates: safeParseJson(values.rates),
      socialmedia: safeParseJson(values.socialmedia),
      resolvedsociallinks: safeParseJson(values.resolvedsociallinks),
      rating: safeParseJson(values.rating),
    };
    console.log("onSubmit updateData:", updateData);
    const { error, data } = await supabase
      .from("merchants")
      .update(updateData)
      .eq("slug", merchant.slug);
    setSaving(false);
    if (error) {
      setError("Failed to update merchant: " + error.message);
      console.error("Supabase update error:", error, "data:", data);
    } else {
      router.push(`/`);
    }
  }



  function safeParseJson(val: string) {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onInvalid={e => { e.preventDefault(); console.log("FORM INVALID", e); }}
      >
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div>
            <label className="font-semibold">Name</label>
            <Input {...register("name")} />
          </div>
          <Textarea label="Description" {...register("description")} />
          <Textarea label="About" {...register("about")} />
          <div>
            <label className="font-semibold">Gender</label>
            <Input {...register("gender")} />
          </div>
          <div>
            <label className="font-semibold">Sexuality</label>
            <Input {...register("sexuality")} />
          </div>
          <div>
            <label className="font-semibold">Phone</label>
            <Input {...register("phone")} />
          </div>
          <div>
            <label className="font-semibold">Last Active</label>
            <Input {...register("last_active")} />
          </div>
          <div>
            <label className="font-semibold">Slug</label>
            <Input {...register("slug")} />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold mb-0">Active</label>
            <input type="checkbox" {...register("active")} />
          </div>
          <Textarea label="Location (JSON)" {...register("location")} minRows={3} />
          <Textarea label="Rates (JSON)" {...register("rates")} minRows={3} />
          <Textarea label="Social Media (JSON)" {...register("socialmedia")} minRows={2} />
          <Textarea label="Resolved Social Links (JSON)" {...register("resolvedsociallinks")} minRows={2} />
          <Textarea label="Rating (JSON)" {...register("rating")} minRows={2} />
          <Textarea label="Services (comma separated)" {...register("services", {
            setValueAs: (v: unknown) => {
              if (typeof v === "string") {
                return v.split(',').map((s: string) => s.trim()).filter(Boolean);
              }
              if (Array.isArray(v)) {
                return v;
              }
              return [];
            }
          })} />
          <MerchantImageManager
            merchantSlug={merchant.slug}
            onImagesChange={(imgs: string[]) => setValue("images", imgs, { shouldValidate: true, shouldDirty: true })}
            initialMainImage={merchant.mainimage}
            initialImages={merchant.images ?? []}
            onMainImageChange={(mainImg: string | null) => setValue("mainimage", mainImg || "")}
          />
          <MerchantVideoManager
            merchantSlug={merchant.slug}
            initialVideoUrl={merchant.videourl}
            onVideoChange={(url: string | null) => setValue("videourl", url)}
          />
          <input type="hidden" {...register("mainimage")} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-stretch">
          <Button type="submit" disabled={saving} onClick={() => console.log("Save button clicked")}>{saving ? "Saving..." : "Save"}</Button>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </CardFooter>
      </form>
    </Card>
  );
}