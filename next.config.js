/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com"],
  },
};

module.exports = nextConfig;
