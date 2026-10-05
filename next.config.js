/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.31.239'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  devIndicators: false,
};

module.exports = nextConfig;