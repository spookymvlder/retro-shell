import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { site } from "../../site.config";

interface CountRow {
    count: number;
}

function normalize(path: string): string {
    // Limit length and strip query/fragments so the table doesn't grow unbounded.
    const cleaned = path.split("?")[0].split("#")[0];
    return cleaned.slice(0, 200);
}

/** GET /api/hits?path=/ — returns the current count without incrementing. */
export async function GET({ url }: APIContext) {
    if (!site.hitCounter.enabled) return Response.json({ count: 0 });

    const path = normalize(url.searchParams.get("path") ?? "/");
    const row = await env.DB.prepare("SELECT count FROM page_views WHERE path = ?")
        .bind(path)
        .first<CountRow>();
    return Response.json({ count: row?.count ?? 0 });
}

/** POST /api/hits with JSON { path } — increments and returns the new count. */
export async function POST({ request }: APIContext) {
    if (!site.hitCounter.enabled) return Response.json({ count: 0 });

    let path = "/";
    try {
        const body = (await request.json()) as { path?: string };
        path = normalize(body.path ?? "/");
    } catch {
        // Default to "/" on bad payloads.
    }

    const now = Math.floor(Date.now() / 1000);

    await env.DB.prepare(
        `INSERT INTO page_views (path, count, updated_at)
         VALUES (?, 1, ?)
         ON CONFLICT(path) DO UPDATE SET
             count = count + 1,
             updated_at = excluded.updated_at`,
    )
        .bind(path, now)
        .run();

    const row = await env.DB.prepare("SELECT count FROM page_views WHERE path = ?")
        .bind(path)
        .first<CountRow>();

    return Response.json({ count: row?.count ?? 1 });
}
