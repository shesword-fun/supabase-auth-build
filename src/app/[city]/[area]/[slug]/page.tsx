import { notFound } from 'next/navigation';
import { createClient } from '@/lib/server';
import { ImageGallery } from '@/components/ImageGallery';
import { PhoneBadge } from '@/components/PhoneBadge';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Navbar } from '@/components/Navbar';
import { CopyButton } from '@/components/CopyButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export default async function MerchantDetailPage({ params }: { params: Promise<{ city: string; area: string; slug: string }> }) {
  const { city, area, slug } = await params;
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  // Fetch current user's user_type
  let currentUserType = null;
  if (currentUser) {
    const { data: userRow } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", currentUser.id)
      .single();
    currentUserType = userRow?.user_type;
  }
  // Fetch merchant
  const { data: merchant, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('slug', decodeURIComponent(slug).trim())
    .single();
  if (error || !merchant || !merchant.active) {
    notFound();
  }
  // Convert storage keys to public URLs using the server-side supabase client
  const images = Array.isArray(merchant.images)
    ? merchant.images.map((img: string) =>
        !img ? "" :
        img.startsWith("http") ? img : supabase.storage.from("merchants").getPublicUrl(img).data.publicUrl || ""
      ).filter(Boolean)
    : [];
  const isAdmin = currentUserType === "admin";
  const isOwner = Boolean(currentUser?.id && merchant?.id && String(currentUser.id) === String(merchant.id));

  const decodedCity = decodeURIComponent(city).trim().toLowerCase();
  const decodedArea = decodeURIComponent(area).trim().toLowerCase();

  // Defensive: location may be null
  const location = merchant.location || {};

  // Type-safe entries for resolvedsociallinks and rates
  const resolvedSocialLinks: [string, string][] = Object.entries(merchant.resolvedsociallinks ?? {});

  if (
    location.city?.toLowerCase() !== decodedCity ||
    location.area?.toLowerCase() !== decodedArea
  ) {
    notFound();
  }

  return (
    <>
      <Navbar />
      {(isAdmin || isOwner) && (
        <div className="flex justify-end mt-4">
          <Link href={`/edit/${merchant.slug}`} className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">
            Edit
          </Link>
        </div>
      )}
      <div className="container mx-auto max-w-5xl py-10 px-4 mx-auto">
      <h1 className="text-3xl font-bold mb-2">{merchant.name}</h1>
      <div className="text-gray-600 mb-4">
        <span className="font-medium">{merchant.location.area}, {merchant.location.city}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Gallery + Video */}
        <div className="flex flex-col gap-4">
          <ImageGallery images={images} altPrefix={merchant.name + ' photo'} />
          <VideoPlayer src={merchant.videoUrl || merchant.video || merchant.videourl || merchant.video_url} />
        </div>
        {/* Right: Info */}
        <div className="flex flex-col gap-6">
          {/* Phone badge always at the top */}
          {merchant.phone && (
            <div className="flex mb-2">
              {/* Client component for phone badge */}
              
              <PhoneBadge phone={merchant.phone} />
            </div>
          )}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 border">
            <div className="mb-2 text-xl font-semibold">About</div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: merchant.about || '' }} />
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 border">
            <div className="mb-2 text-xl font-semibold">Online & Rates</div>
            {/* Social Media Handles (Payment/Contact) */}
            {(merchant.socialmedia && Object.keys(merchant.socialmedia).length > 0) && (
              <div className="mb-2">
                <div className="mb-2 text-xs font-semibold">Payment & Contact</div>
                {/* Always show phone/whatsapp if present */}
                {(() => {
                  // Priority: merchant.phone > merchant.mobile > merchant.whatsapp > socialmedia
                  let phoneLabel = '';
                  let phoneValue = '';
                  if (merchant.phone) {
                    phoneLabel = 'Phone';
                    phoneValue = merchant.phone;
                  } else if (merchant.mobile) {
                    phoneLabel = 'Mobile';
                    phoneValue = merchant.mobile;
                  } else if (merchant.whatsapp) {
                    phoneLabel = 'WhatsApp';
                    phoneValue = merchant.whatsapp;
                  } else if (merchant.socialmedia) {
                    const phoneEntry = Object.entries(merchant.socialmedia).find(([platform]) => /phone|mobile|tel|whatsapp/i.test(platform));
                    if (phoneEntry) {
                      phoneLabel = phoneEntry[0];
                      phoneValue = phoneEntry[1] as string;
                    }
                  }
                  if (phoneValue) {
                    return (
                      <span className="inline-flex items-center px-3 py-1 rounded bg-primary text-white text-sm font-semibold gap-1 shadow border border-primary/70 mr-2 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.46l.48 1.7a2 2 0 01-.45 1.94l-.7.7a16.06 16.06 0 006.36 6.36l.7-.7a2 2 0 011.94-.45l1.7.48A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 5V4a2 2 0 012-2h1z" /></svg>
                        <span className="font-semibold mr-1">{phoneLabel}:</span>
                        <span>{phoneValue}</span>
                        <CopyButton
                              value={phoneValue}
                              className="ml-1 px-1 py-0.5 rounded bg-white/30 text-xs hover:bg-white/50"
                              title="Copy to clipboard"
                            />
                      </span>
                    );
                  }
                  return null;
                })()}
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(merchant.socialmedia).map(([platform, value]) => {
                    const isUrl = typeof value === 'string' && /^https?:\/\//i.test(value);
                    const isPhone = /phone|mobile|tel/i.test(platform);
                    return (
                      <span
                        key={platform}
                        className={
                          isPhone
                            ? "inline-flex items-center px-3 py-1 rounded bg-primary text-white text-sm font-semibold gap-1 shadow border border-primary/70"
                            : "inline-flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium gap-1"
                        }
                      >
                        {isPhone && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.46l.48 1.7a2 2 0 01-.45 1.94l-.7.7a16.06 16.06 0 006.36 6.36l.7-.7a2 2 0 011.94-.45l1.7.48A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 5V4a2 2 0 012-2h1z" /></svg>
                        )}
                        <span className="font-semibold mr-1">{platform}:</span>
                        {isUrl ? (
                          <a href={value as string} target="_blank" rel="noopener noreferrer" className="underline">{value as string}</a>
                        ) : (
                          <>
                            <span>{value as string}</span>
                            <CopyButton
                                value={value as string}
                                className="ml-1 px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                                title="Copy to clipboard"
                              />
                          </>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Resolved Social Links */}
            {(merchant.resolvedsociallinks && Object.keys(merchant.resolvedsociallinks).length > 0) && (
              <div className="mb-2">
                <div className="text-xs font-semibold mb-1">Resolved Social Links</div>
                <div className="flex flex-wrap items-center gap-2">
                  {resolvedSocialLinks.map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-medium hover:underline">
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Rates */}
            {merchant.rates && typeof merchant.rates === "object" && (
              <div className="flex flex-wrap gap-4 mb-4">
                {["In-Call", "Out-Call"].map((rateType) => {
                  // Find the key case-insensitively
                  const key = Object.keys(merchant.rates).find(
                    (k) => k.toLowerCase() === rateType.toLowerCase()
                  );
                  if (!key) return null;
                  const durations = merchant.rates[key];
                  return (
                    <Card key={key} className="min-w-[220px] flex-1">
                      <CardHeader>
                        <CardTitle className="text-lg">{rateType}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Object.entries(durations).length > 0 ? (
                          <ul className="space-y-1">
                            {Object.entries(durations).map(([duration, price]) => (
                              <li key={duration} className="flex justify-between">
                                <span className="font-medium">{duration}</span>
                                <span>{String(price).replace(/\s+GBP$/, " GBP")}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400 italic">No rates listed</span>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border">
            <div className="mb-2 text-lg font-semibold">Services</div>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(merchant.services) && merchant.services.length > 0 ? (
                merchant.services.map((service: string, i: number) => (
                  <span key={i} className="bg-primary/80 text-white px-2 py-1 rounded text-xs font-medium">
                    {service}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">No services listed</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Description at bottom */}
      <div className="mt-10 bg-white dark:bg-gray-900 rounded-xl shadow p-6 border col-span-full">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Description</h2>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: merchant.description || '' }} />
      </div>
    </div>
    </>
  );
}
