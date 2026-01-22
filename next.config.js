/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // API key is server-side only, never exposed to client
  serverRuntimeConfig: {
    googleApiKey: process.env.GOOGLE_API_KEY,
  },
  // Only expose non-sensitive config to client
  publicRuntimeConfig: {
    appName: 'ISW Asset Generator',
  },
}

module.exports = nextConfig
