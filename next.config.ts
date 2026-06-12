import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 restricts allowed values to [75] by default; allow higher
    // quality so the hero photo is served crisp (quality={95}).
    qualities: [75, 88, 90, 95],
  },
};

export default nextConfig;
