/// <reference types="@cloudflare/workers-types" />

declare module "cloudflare:workers" {
    interface Env {
        DB: D1Database;
        ASSETS: Fetcher;
        PUBLIC_TURNSTILE_SITE_KEY: string;
        TURNSTILE_SECRET: string;
        IP_HASH_SALT: string;
    }
}
