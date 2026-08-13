import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dev-only: backend runs on localhost, which Next's image optimizer treats as a
    // private-IP SSRF risk by default. Safe here since both run on the same machine.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '6060',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
