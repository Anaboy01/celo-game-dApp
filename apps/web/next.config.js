/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    // Existing externals
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Add fallbacks to stop Next.js from trying to load React-Native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
    };

    return config;
  },
};

module.exports = nextConfig;
