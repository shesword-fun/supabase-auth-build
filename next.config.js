/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stqsnnvovkhpmvqiogjq.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
