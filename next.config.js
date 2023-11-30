/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // env: {
  //   BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  // },
  images: {
    domains: ["photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com"],
  },
};

module.exports = nextConfig;
