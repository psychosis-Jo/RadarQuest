/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@radar-quest/shared'],
  images: {
    formats: ['image/avif', 'image/webp']
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react']
  }
};

export default nextConfig;
