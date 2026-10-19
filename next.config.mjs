/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: "/tienda",
        destination: "/#templates",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
