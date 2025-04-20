import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use env vars for security
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for admin ops
)

async function downloadFile(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download: ${url}`)
  return await res.arrayBuffer()
}

export async function POST(req: NextRequest) {
  try {
    const manifest = await req.json();
    const results: unknown[] = [];
    

    // Validate manifest structure
    if (!manifest || !Array.isArray(manifest.items) || manifest.items.length === 0) {
      return NextResponse.json({ status: 'error', error: 'Manifest is missing or has no items.' }, { status: 400 });
    }

    interface UploadResults {
      slug: string;
      uploads: Array<{ type: string; filename: string; error?: string; path: string }>;
      db: string | null;
      errors: string[];
    }

    for (const [idx, merchant] of manifest.items.entries()) {
      const slug = merchant.slug || merchant.name?.toLowerCase().replace(/\s+/g, '-') || `merchant-${idx}`;
      const uploadResults: UploadResults = { slug, uploads: [], db: null, errors: [] };

      // Helper to upload a file (image, thumbnail, video, etc)
      async function uploadAsset(assetUrl: string, type: string, filename: string, customPath?: string) {
        if (!assetUrl) return null;
        try {
          const data = await downloadFile(assetUrl);
          const path = customPath || `${slug}/${type}/${filename}`;
          const { error } = await supabase.storage.from('merchants').upload(path, data, { upsert: true });
          uploadResults.uploads.push({ type, filename, error: error?.message, path });
          if (error) {
            uploadResults.errors.push(`Storage upload error for ${type}/${filename}: ${error.message}`);
          }
          return error;
        } catch (e: unknown) {
          if (e instanceof Error) {
            uploadResults.errors.push(`Download/upload failed for ${type}/${filename}: ${e.message}`);
          } else {
            uploadResults.errors.push(`Download/upload failed for ${type}/${filename}: Unknown error`);
          }
          return e;
        }
      }

      // Supabase base URL for public assets
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      // Store the uploaded asset paths for DB
      const imageUrls: string[] = [];
      const thumbnailUrls: string[] = [];
      let mainImageUrl: string | null = null;
      let videoUrl: string | null = null;

      // Upload images with unique sequential filenames
      if (Array.isArray(merchant.images)) {
        for (let i = 0; i < merchant.images.length; i++) {
          const imgUrl = merchant.images[i];
          const ext = imgUrl.split('.').pop()?.split('?')[0] || 'jpg';
          const filename = `image-${i + 1}.${ext}`;
          const storagePath = `public/${slug}/images/${filename}`;
          await uploadAsset(imgUrl, 'images', filename, storagePath);
          imageUrls.push(`${supabaseUrl}/storage/v1/object/public/merchants/public/${slug}/images/${filename}`);
        }
      }
      // Upload thumbnails with unique sequential filenames
      if (Array.isArray(merchant.thumbnails)) {
        for (let i = 0; i < merchant.thumbnails.length; i++) {
          const thumbUrl = merchant.thumbnails[i];
          const ext = thumbUrl.split('.').pop()?.split('?')[0] || 'jpg';
          const filename = `thumbnail-${i + 1}.${ext}`;
          const storagePath = `public/${slug}/thumbnails/${filename}`;
          await uploadAsset(thumbUrl, 'thumbnails', filename, storagePath);
          thumbnailUrls.push(`${supabaseUrl}/storage/v1/object/public/merchants/public/${slug}/thumbnails/${filename}`);
        }
      }
      // Upload main image
      if (merchant.mainImage) {
        const mainImageFilename = merchant.mainImage.split('/').pop() || 'main-image.jpg';
        const storagePath = `public/${slug}/main-image/${mainImageFilename}`;
        await uploadAsset(merchant.mainImage, 'main-image', mainImageFilename, storagePath);
        mainImageUrl = `${supabaseUrl}/storage/v1/object/public/merchants/public/${slug}/main-image/${mainImageFilename}`;
      }
      // Upload videourl
      if (merchant.videoUrl) {
        const videoFilename = merchant.videoUrl.split('/').pop() || 'video.mp4';
        const storagePath = `public/${slug}/video/${videoFilename}`;
        await uploadAsset(merchant.videoUrl, 'video', videoFilename, storagePath);
        videoUrl = `${supabaseUrl}/storage/v1/object/public/merchants/public/${slug}/video/${videoFilename}`;
      }


      // Upsert merchant in DB 
      try {
        // Map manifest keys to DB columns
        const merchantForDb: Record<string, unknown> = { slug };
        if (merchant.name) merchantForDb.name = merchant.name;
        if (merchant.description) merchantForDb.description = merchant.description;
        if (merchant.about) merchantForDb.about = merchant.about;
        if (merchant.phone) {
          merchantForDb.phone = merchant.phone;
        } else {
          merchantForDb.active = false;
        }
        if (merchant.gender) merchantForDb.gender = merchant.gender;
        if (merchant.sexuality) merchantForDb.sexuality = merchant.sexuality;
        if (merchant.location) merchantForDb.location = merchant.location;
        if (merchant.lastActive) merchantForDb.last_active = merchant.lastActive;
        if (merchant.rating) merchantForDb.rating = merchant.rating;
        if (merchant.rates) merchantForDb.rates = merchant.rates;
        if (merchant.services) merchantForDb.services = merchant.services;
        if (imageUrls.length) merchantForDb.images = imageUrls;
        if (thumbnailUrls.length) merchantForDb.thumbnails = thumbnailUrls;
        if (mainImageUrl) merchantForDb.mainimage = mainImageUrl;
        if (videoUrl) merchantForDb.videourl = videoUrl;
        if (merchant.socialMedia) merchantForDb.socialmedia = merchant.socialMedia;
        if (merchant.resolvedSocialLinks) merchantForDb.resolvedsociallinks = merchant.resolvedSocialLinks;

        const { error: dbError } = await supabase.from('merchants').upsert(merchantForDb, { onConflict: 'slug' });
        uploadResults.db = dbError?.message || 'ok';
        if (dbError) {
          uploadResults.errors.push(`DB upsert error: ${dbError.message}`);
        }
      } catch (e: unknown) {
        uploadResults.db = 'exception';
        if (e instanceof Error) {
          uploadResults.errors.push(`DB upsert exception: ${e.message}`);
        } else {
          uploadResults.errors.push('DB upsert exception: Unknown error');
        }
      }
      results.push(uploadResults);
    }
    // Return all results, including errors
    return NextResponse.json({ status: 'done', results });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ status: 'error', error: err.message, stack: err.stack }, { status: 500 });
    } else {
      return NextResponse.json({ status: 'error', error: 'Unknown error' }, { status: 500 });
    }
  }
}

