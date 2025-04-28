import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: false,
  },
  env: {
    AIRTABLE_READ_API_KEY: process.env.AIRTABLE_READ_API_KEY,
    ACTIVECAMPAIGN_API_KEY: process.env.ACTIVECAMPAIGN_API_KEY,
    ACTIVECAMPAIGN_TOKEN: process.env.ACTIVECAMPAIGN_TOKEN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  }
};

export default nextConfig;
