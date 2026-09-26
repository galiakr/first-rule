/**
 * The game is a static site: no API routes, no server actions, no runtime
 * data. Everything — the engine, the content, the save — runs in the browser.
 * So it exports to plain files and can be served from anywhere, GitHub Pages
 * included.
 *
 * `basePath` is needed because Pages serves a project site from a
 * subdirectory (`/first-rule`), not from the domain root, and without it
 * every asset resolves one level too high. It is applied only for the Pages
 * build so `npm run dev` and the e2e suite still work at `/`.
 *
 * `images.unoptimized` is required by `output: "export"`: the default image
 * optimiser needs a server. The game ships no images today, but leaving this
 * out means the build breaks the first time somebody adds one.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Pages has no trailing-slash rewriting, so emit real directories with an
  // index.html inside. Without it, /first-rule/ would 404.
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: process.env.PAGES_BASE_PATH || undefined,
};

export default nextConfig;
