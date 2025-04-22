import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://funwith.fun';
  const robots = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`;
  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
