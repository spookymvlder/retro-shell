// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
    // Set this to your real domain before deploying — used to build absolute
    // URLs for Open Graph tags, canonical links, and the sitemap.
    site: "https://yoursite.com",
    output: "server",
    adapter: cloudflare({
        // Lets `astro dev` access D1 + secrets from wrangler.jsonc / .dev.vars locally.
        platformProxy: { enabled: true },
    }),
    integrations: [
        // Auto-generates /sitemap-index.xml + /sitemap-0.xml from prerendered routes.
        // SSR routes (search, guestbook, /api/*) are excluded automatically.
        sitemap(),
    ],
});
