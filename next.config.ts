import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Allow all paths from this domain
      },
    ],
  },
  reactCompiler: false,
};

export default nextConfig;
