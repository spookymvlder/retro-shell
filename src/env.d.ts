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
    }
}
