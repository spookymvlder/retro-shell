import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { XMLParser } from "fast-xml-parser";
import { site } from "../../site.config";

interface OutputPlay {
    gameId: number;
    name: string;
    date: string;
    quantity: number;
    thumbnail?: string;
    bggUrl: string;
}

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    isArray: (name) => ["play", "item"].includes(name),
});

/** BGG returns 202 (queued) on cold cache. Retry once after a short wait.
 *  As of 2026 BGG requires a Bearer token — register at
 *  https://boardgamegeek.com/using_the_xml_api to obtain one. */
async function fetchBgg(url: string): Promise<Response | null> {
    const token = env.BGG_API_TOKEN;
    if (!token) return null;
    const headers: Record<string, string> = {
        Accept: "application/xml",
        Authorization: `Bearer ${token}`,
    };
    for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(url, { headers });
        if (res.status === 200) return res;
        if (res.status === 202 && attempt === 0) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
        }
        return null;
    }
    return null;
}

interface PlayItem {
    objectid?: string;
    name?: string;
}
interface PlayNode {
    date?: string;
    quantity?: string;
    item?: PlayItem[];
}
interface PlaysRoot {
    plays?: { play?: PlayNode[] };
}

interface ThingItem {
    id?: string;
    thumbnail?: string;
}
interface ThingsRoot {
    items?: { item?: ThingItem[] };
}

async function fetchPlays(username: string, count: number): Promise<OutputPlay[]> {
    const res = await fetchBgg(
        `https://boardgamegeek.com/xmlapi2/plays?username=${encodeURIComponent(username)}&page=1`,
    );
    if (!res) return [];

    const xml = await res.text();
    const data = parser.parse(xml) as PlaysRoot;
    const plays = data.plays?.play ?? [];

    const out: OutputPlay[] = [];
    const seen = new Set<number>();
    for (const p of plays) {
        const item = p.item?.[0];
        const gameId = Number(item?.objectid ?? 0);
        if (!gameId || seen.has(gameId)) continue;
        seen.add(gameId);
        out.push({
            gameId,
            name: item?.name ?? "Unknown",
            date: p.date ?? "",
            quantity: Number(p.quantity ?? 1),
            bggUrl: `https://boardgamegeek.com/boardgame/${gameId}`,
        });
        if (out.length >= count) break;
    }
    return out;
}

async function attachThumbnails(plays: OutputPlay[]): Promise<void> {
    if (!plays.length) return;
    const ids = plays.map((p) => p.gameId).join(",");
    const res = await fetchBgg(
        `https://boardgamegeek.com/xmlapi2/thing?id=${ids}&type=boardgame`,
    );
    if (!res) return;

    const xml = await res.text();
    const data = parser.parse(xml) as ThingsRoot;
    const items = data.items?.item ?? [];
    const byId = new Map<number, string>();
    for (const it of items) {
        const id = Number(it.id ?? 0);
        if (id && it.thumbnail) byId.set(id, it.thumbnail);
    }
    for (const p of plays) {
        const thumb = byId.get(p.gameId);
        if (thumb) p.thumbnail = thumb;
    }
}

export async function GET(_context: APIContext) {
    if (!site.bgg.enabled) return Response.json({ plays: [] });
    if (
        !site.bgg.username ||
        site.bgg.username === "YOUR_BGG_USERNAME" ||
        !env.BGG_API_TOKEN
    ) {
        return Response.json({ plays: [], error: "not-configured" });
    }

    const cacheUrl = new URL(
        `https://retro-shell.cache/bgg?u=${encodeURIComponent(site.bgg.username)}&n=${site.bgg.count}&t=${site.bgg.fetchThumbnails ? 1 : 0}`,
    );
    const cacheKey = new Request(cacheUrl.toString());
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    let payload: { plays: OutputPlay[]; error?: string };
    try {
        const plays = await fetchPlays(site.bgg.username, site.bgg.count);
        if (site.bgg.fetchThumbnails) await attachThumbnails(plays);
        payload = { plays };
    } catch {
        payload = { plays: [], error: "fetch-failed" };
    }

    const response = Response.json(payload, {
        headers: {
            "Cache-Control": `public, max-age=${site.bgg.cacheSeconds}`,
        },
    });
    await cache.put(cacheKey, response.clone());
    return response;
}
