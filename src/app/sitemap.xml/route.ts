import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET() {
  const supabase = await createClient();
  const { data: merchants } = await supabase.from('merchants').select('slug, location');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://funwith.fun';

  const staticRoutes = [
    '',
    'admin',
    'auth',
    'user-type-dashboard',
    // add more static routes as needed
  ];

  let urls = staticRoutes.map((route) => `${baseUrl}/${route}`);

  if (Array.isArray(merchants)) {
    urls = urls.concat(
      merchants.map((m) => {
        const city = encodeURIComponent(m.location?.city || '');
        const area = encodeURIComponent(m.location?.area || '');
        return `${baseUrl}/${city}/${area}/${m.slug}`;
      })
    );
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n') +
    `\n</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
