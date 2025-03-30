/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    // Enable WebAssembly for TensorFlow.js
    config.experiments = { 
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true
    };
    return config;
  },
  // Allow access from all origins with proper CORS headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig; 