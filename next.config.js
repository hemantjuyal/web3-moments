/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['<NEXT_PUBLIC_DEDICATED_GATEWAY from .env.local>'],
  },
}

module.exports = nextConfig
