/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // CORS is opened on the *public* API only. It is deliberately NOT applied
        // to /api/auth, /api/keys or /api/billing: those are cookie-authenticated
        // and belong to the first-party dashboard, and advertising cross-origin
        // access to them serves no one but an attacker writing a CSRF page.
        source: "/api/v1/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization,x-api-key" },
        ],
      },
      {
        source: "/api/health",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
      {
        // Applied site-wide. These four are the ones that actually prevent
        // something: clickjacking, MIME sniffing, referrer leakage to third
        // parties, and browser feature access nothing here needs.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
