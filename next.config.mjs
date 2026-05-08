/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  // Suppress Prisma import warning in dev (Prisma client unused in demo mode)
  serverExternalPackages: ['@prisma/client', 'prisma'],
}

export default nextConfig
