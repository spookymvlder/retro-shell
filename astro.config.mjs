// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
    // Set this to your real domain before deploying — used to build absolute
    // URLs for Open Graph tags, canonical links, and the sitemap.
    site: "https://yoursite.com",
    output: "server",
    // The Cloudflare adapter (v13+) wires up local D1 + secrets automatically
    // via @cloudflare/vite-plugin reading wrangler.jsonc and .dev.vars.
    adapter: cloudflare(),
    integrations: [
        // Auto-generates /sitemap-index.xml + /sitemap-0.xml from prerendered routes.
        // SSR routes (search, guestbook, /api/*) are excluded automatically.
        sitemap(),
    ],
});
