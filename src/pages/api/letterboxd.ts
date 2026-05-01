import type { APIContext } from "astro";
import { XMLParser } from "fast-xml-parser";
import { site } from "../../site.config";

interface OutputItem {
    title: string;
    year: string;
    stars: string;
    rewatch: boolean;
    link: string;
    poster?: string;
    dateLabel: string;
}

interface RssItem {
    title?: string;
    link?: string;
    description?: string;
    pubDate?: string;
    "letterboxd:filmTitle"?: string;
    "letterboxd:filmYear"?: string | number;
    "letterboxd:memberRating"?: string | number;
    "letterboxd:rewatch"?: string;
    "letterboxd:watchedDate"?: string;
}

interface RssRoot {
    rss?: {
        channel?: {
            item?: RssItem[];
        };
    };
}

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    isArray: (name) => name === "item",
});

/** Convert a numeric rating (e.g. 4.5) into a star string (e.g. "★★★★½"). */
function ratingToStars(rating: unknown): string {
    const n = typeof rating === "number" ? rating : parseFloat(String(rating ?? ""));
    if (!n || isNaN(n) || n <= 0) return "";
    const full = Math.floor(n);
    const half = n - full >= 0.5;
    return "★".repeat(full) + (half ? "½" : "");
}

/** Letterboxd embeds the poster as <img src="..."> in the RSS description. */
function extractPoster(html: string | undefined): string | undefined {
    if (!html) return undefined;
    const m = html.match(/<img[^>]+src="([^"]+)"/);
    return m?.[1];
}

function formatDate(value: string | undefined): string {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function GET(_context: APIContext) {
    if (!site.letterboxd.enabled) return Response.json({ items: [] });
    if (!site.letterboxd.username || site.letterboxd.username === "YOUR_LETTERBOXD_USERNAME") {
        return Response.json({ items: [], error: "not-configured" });
    }

    const cacheUrl = new URL(
        `https://retro-shell.cache/letterboxd?u=${encodeURIComponent(site.letterboxd.username)}&n=${site.letterboxd.count}`,
    );
    const cacheKey = new Request(cacheUrl.toString());
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    let payload: { items: OutputItem[]; error?: string };
    try {
        const url = `https://letterboxd.com/${encodeURIComponent(site.letterboxd.username)}/rss/`;
        const res = await fetch(url, {
            headers: {
                Accept: "application/rss+xml, application/xml",
                "User-Agent":
                    "Mozilla/5.0 (compatible; retro-shell/1.0; +https://github.com/spookymvlder/retro-shell)",
            },
        });
        if (!res.ok) throw new Error(`Letterboxd ${res.status}`);

        const xml = await res.text();
        const data = parser.parse(xml) as RssRoot;
        const items = data.rss?.channel?.item ?? [];

        const out: OutputItem[] = items
            // Filter out non-diary entries (e.g. lists, reviews without a watch date).
            .filter((it) => !!it["letterboxd:watchedDate"])
            .slice(0, site.letterboxd.count)
            .map((it) => ({
                title: String(it["letterboxd:filmTitle"] ?? "Unknown"),
                year: String(it["letterboxd:filmYear"] ?? ""),
                stars: ratingToStars(it["letterboxd:memberRating"]),
                rewatch: String(it["letterboxd:rewatch"] ?? "").toLowerCase() === "yes",
                link: String(it.link ?? ""),
                poster: extractPoster(it.description),
                dateLabel: formatDate(it["letterboxd:watchedDate"]),
            }));

        payload = { items: out };
    } catch {
        payload = { items: [], error: "fetch-failed" };
    }

    const response = Response.json(payload, {
        headers: {
            "Cache-Control": `public, max-age=${site.letterboxd.cacheSeconds}`,
        },
    });
    await cache.put(cacheKey, response.clone());
    return response;
}
