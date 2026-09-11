/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone: genera server.js autosuficiente para empaquetar en Electron.
  output: "standalone",
};
export default nextConfig;
