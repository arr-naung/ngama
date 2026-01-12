/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/db"],
    images: {
        domains: ["res.cloudinary.com"],
    },
};

export default nextConfig;
