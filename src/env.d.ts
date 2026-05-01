// Don't use `/// <reference types="@cloudflare/workers-types" />` here:
// it declares globals (Element, Request, Response, etc.) that conflict with
// the DOM lib in client-side <script> blocks. Inline imports below scope the
// worker types to just the binding declarations.

declare module "cloudflare:workers" {
    interface Env {
        DB: import("@cloudflare/workers-types").D1Database;
        ASSETS: import("@cloudflare/workers-types").Fetcher;
        PUBLIC_TURNSTILE_SITE_KEY: string;
        TURNSTILE_SECRET: string;
        IP_HASH_SALT: string;
        STEAM_API_KEY: string;
        BGG_API_TOKEN: string;
    }

    /** The bindings exposed to the running Worker. Astro 6 ships this at runtime
     *  via `@astrojs/cloudflare`; the TS types don't include the export, so we
     *  add it manually here. */
    export const env: Env;
}

/** Cloudflare Workers exposes `caches.default` in addition to the standard
 *  named-cache API. The DOM lib doesn't know about it. */
interface CacheStorage {
    default: Cache;
}
