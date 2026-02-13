/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'directus-koko8soc8sckg0c4woggkwsk.159.65.150.129.sslip.io',
      },
    ],
  },
}

export default nextConfig
