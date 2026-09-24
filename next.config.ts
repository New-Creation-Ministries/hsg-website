import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/events/feeds/:id.ics",
        destination: "/events/feeds/:id",
      },
    ];
  },
};

export default nextConfig;
