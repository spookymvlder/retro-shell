// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
    output: "server",
    adapter: cloudflare({
        // Lets `astro dev` access D1 + secrets from wrangler.jsonc / .dev.vars locally.
        platformProxy: { enabled: true },
    }),
});
