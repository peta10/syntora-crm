import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static export for Tauri
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };

      // Handle Tauri imports
      config.externals = {
        ...config.externals,
        '@tauri-apps/api': 'window.__TAURI__',
        '@tauri-apps/api/window': 'window.__TAURI__.window',
        '@tauri-apps/api/notification': 'window.__TAURI__.notification',
        '@tauri-apps/api/shell': 'window.__TAURI__.shell',
        '@tauri-apps/api/tauri': 'window.__TAURI__.tauri',
      };
    }

    return config;
  },
};

export default nextConfig;
