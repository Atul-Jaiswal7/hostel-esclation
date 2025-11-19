
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Vercel specific optimizations
  serverExternalPackages: ['firebase-admin'],
  // Fix for Next.js 15 route groups on Vercel
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
