import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 restricts allowed values to [75] by default; allow higher
    // quality so the hero photo is served crisp (quality={95}).
    qualities: [75, 88, 90, 95],
  },
  // Keep the PAY-by-square / QR generators as native server-side modules
  // (loaded at runtime) instead of bundling them. bysquare is ESM-only and
  // pulls in lzma1, so leaving it external avoids bundler edge cases on Vercel.
  serverExternalPackages: ["bysquare", "qrcode"],
};

export default nextConfig;
