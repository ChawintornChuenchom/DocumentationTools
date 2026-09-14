import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// tesseract.js (OCR) fetches its worker script, WASM core, and language data
// from jsdelivr at runtime — all requests are pinned to specific package
// versions, never a floating "latest" tag. That's the only third-party
// origin this app talks to; everything else (fonts, pdf.js worker) is
// self-hosted by the build.
//
// script-src keeps 'unsafe-inline' rather than a per-request nonce: nonces
// require middleware + a dynamic (non-static) root layout, which would break
// this app's static-export deploy path for no real benefit — nothing in this
// codebase ever renders untrusted content as HTML (no dangerouslySetInnerHTML,
// no innerHTML, no eval), so there's no script-injection vector for
// 'unsafe-inline' to actually expose here.
const CSP = [
  "default-src 'self'",
  // 'wasm-unsafe-eval' (not covered by 'unsafe-inline') is required for
  // tesseract.js's WebAssembly.instantiate() call — without it the wasm
  // compile throws inside the worker and tesseract.js swallows the error,
  // so OCR just hangs forever at "initializing" instead of failing loudly.
  isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net"
    : "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  // React writes inline `style` attributes (transforms, progress bars), which
  // CSP treats as inline styles — 'unsafe-inline' is required for those.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  // PDF result previews render via <iframe src="blob:...">.
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
