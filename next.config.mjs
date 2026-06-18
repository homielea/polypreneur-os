/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The legacy Vite prototype is archived under /legacy and excluded from the build.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
