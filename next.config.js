/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com",
      },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;
