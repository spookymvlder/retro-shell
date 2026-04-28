/// <reference types="@cloudflare/workers-types" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
    DB: D1Database;
    ASSETS: Fetcher;
    PUBLIC_TURNSTILE_SITE_KEY: string;
    TURNSTILE_SECRET: string;
    IP_HASH_SALT: string;
}>;

declare namespace App {
    interface Locals extends Runtime {}
}

interface ImportMetaEnv {
    readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
