/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "udzgfeothpunfcipeqbh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
        pathname: "/get/**",
      },
    ],
  },
};

module.exports = nextConfig;
