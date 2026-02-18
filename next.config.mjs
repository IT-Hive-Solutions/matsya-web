/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@directus/sdk"],
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'directus-koko8soc8sckg0c4woggkwsk.159.65.150.129.sslip.io',
      },
    ],
  },


}

export default nextConfig
