import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
export { nextConfig };
