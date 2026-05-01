import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { site } from "../../site.config";

interface SteamGame {
    appid: number;
    name: string;
    playtime_2weeks?: number;
    playtime_forever?: number;
    img_icon_url?: string;
}

interface SteamResponse {
    response?: {
        total_count?: number;
        games?: SteamGame[];
    };
}

interface OutputGame {
    appid: number;
    name: string;
    minutes2Weeks: number;
    minutesForever: number;
    /** Steam CDN capsule image — wider than the icon, recognizable at a glance. */
    capsuleUrl: string;
    /** Link to the game's Steam store page. */
    storeUrl: string;
}

export async function GET(_context: APIContext) {
    if (!site.steam.enabled) return Response.json({ games: [] });

    const apiKey = env.STEAM_API_KEY;
    if (!apiKey || !site.steam.steamId || site.steam.steamId === "YOUR_STEAM_ID") {
        return Response.json({ games: [], error: "not-configured" });
    }

    const cacheUrl = new URL(
        `https://retro-shell.cache/steam?id=${encodeURIComponent(site.steam.steamId)}&n=${site.steam.count}`,
    );
    const cacheKey = new Request(cacheUrl.toString());
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    let payload: { games: OutputGame[]; error?: string };
    try {
        const url = new URL("https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/");
        url.searchParams.set("key", apiKey);
        url.searchParams.set("steamid", site.steam.steamId);
        url.searchParams.set("count", String(site.steam.count));

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Steam API ${res.status}`);
        const data = (await res.json()) as SteamResponse;
        const games = data.response?.games ?? [];

        payload = {
            games: games.slice(0, site.steam.count).map((g) => ({
                appid: g.appid,
                name: g.name,
                minutes2Weeks: g.playtime_2weeks ?? 0,
                minutesForever: g.playtime_forever ?? 0,
                capsuleUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_184x69.jpg`,
                storeUrl: `https://store.steampowered.com/app/${g.appid}/`,
            })),
        };
    } catch {
        payload = { games: [], error: "fetch-failed" };
    }

    const response = Response.json(payload, {
        headers: {
            "Cache-Control": `public, max-age=${site.steam.cacheSeconds}`,
        },
    });
    await cache.put(cacheKey, response.clone());
    return response;
}
