import type { NextConfig } from "next";

// The Express API (the server/ folder). Locally it runs on port 5000.
const API_URL = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // The browser only ever talks to this website. Every /api request, including login, is passed
  // on to the API, so login cookies belong to this site and no CORS setup is needed.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
