import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable experimental features for Cloudflare
  experimental: {
    // Runtime configuration for Cloudflare Workers
  },

  // Ensure compatibility with Cloudflare Pages
  images: {
    // Disable image optimization for Cloudflare (use Cloudflare Image Resizing)
    unoptimized: true,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }

    // Fix for Cloudflare Workers: exclude Node.js built-in modules
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Polyfill or exclude async_hooks for edge runtime
      async_hooks: false,
    };

    return config;
  },
};

export default nextConfig;
