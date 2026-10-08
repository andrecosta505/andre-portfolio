import type { NextConfig } from 'next';

// Static export: `npm run build` writes plain files to out/, which deploy to Hostinger as they are.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
