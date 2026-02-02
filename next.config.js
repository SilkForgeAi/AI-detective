/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16 compatibility
  experimental: {
    // Add any experimental features if needed
  },
  // Turbopack configuration (empty to allow webpack config)
  turbopack: {},
  // Webpack configuration for Cesium
  webpack: (config, { isServer }) => {
    // Cesium configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Copy Cesium assets
    config.module.rules.push({
      test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
      type: 'asset/resource',
    })

    return config
  },
  // Copy Cesium static files
  async headers() {
    return [
      {
        source: '/cesium/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
