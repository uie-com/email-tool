import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: false,
  },
  env: {
    AIRTABLE_READ_API_KEY: process.env.AIRTABLE_READ_API_KEY
  }
};

export default nextConfig;
