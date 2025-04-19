import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: false,
  },
  env: {
    AIRTABLE_READ_API_KEY: process.env.AIRTABLE_READ_API_KEY,
    ACTIVECAMPAIGN_API_KEY: process.env.ACTIVECAMPAIGN_API_KEY,
    ACTIVECAMPAIGN_TOKEN: process.env.ACTIVECAMPAIGN_TOKEN,
  }
};

export default nextConfig;
