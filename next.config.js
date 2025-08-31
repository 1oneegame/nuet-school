/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-icons', 'styled-jsx'],
  reactStrictMode: true,
  // Ensure styled-jsx is properly resolved
  webpack: (config, { isServer }) => {
    // Ensure styled-jsx is resolved correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-jsx': require.resolve('styled-jsx'),
      'styled-jsx/style': require.resolve('styled-jsx/style'),
    };
    return config;
  },
  images: {
    domains: ['localhost', 'example.com'], // Add your Vercel domain here when deployed
  },
  // Optimize for production
  swcMinify: true,
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './public/uploads/**',
        './node_modules/**',
        './.next/cache/**'
      ]
    }
  },
  // Handle API routes properly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXTAUTH_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;