import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: lets phones on your Wi-Fi load dev assets. Use your PC's IPv4 from `ipconfig`.
  allowedDevOrigins: ['192.168.39.122'],
};



export default nextConfig;

