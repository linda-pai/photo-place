/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com",
        pathname: "/images-dev/**",
      },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;
