// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
    // Set this to your real domain before deploying — used to build absolute
    // URLs for Open Graph tags and the canonical link.
    site: "https://yoursite.com",
    output: "server",
    adapter: cloudflare({
        // Lets `astro dev` access D1 + secrets from wrangler.jsonc / .dev.vars locally.
        platformProxy: { enabled: true },
    }),
});
