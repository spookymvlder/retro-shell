import type { APIContext } from "astro";
import { site } from "../../site.config";

interface TickerEntry {
    symbol: string;
    label: string;
    price: number;
    change: number;
    changePercent: number;
}

interface YahooMeta {
    regularMarketPrice?: number;
    chartPreviousClose?: number;
    previousClose?: number;
}

async function fetchOne(symbol: string, label: string): Promise<TickerEntry | null> {
    try {
        const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
            {
                headers: {
                    // Yahoo blocks generic UAs.
                    "User-Agent": "Mozilla/5.0 (compatible; retro-shell ticker)",
                    Accept: "application/json",
                },
            },
        );
        if (!res.ok) return null;
        const data = (await res.json()) as { chart?: { result?: { meta?: YahooMeta }[] } };
        const meta = data.chart?.result?.[0]?.meta;
        if (!meta?.regularMarketPrice) return null;

        const price = meta.regularMarketPrice;
        const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
        const change = price - prev;
        const changePercent = prev ? (change / prev) * 100 : 0;

        return { symbol, label, price, change, changePercent };
    } catch {
        return null;
    }
}

export async function GET(_context: APIContext) {
    if (!site.ticker.enabled) {
        return Response.json({ entries: [] });
    }

    // Edge cache key includes the configured symbols so changes to config
    // bust the cache cleanly on the next deploy.
    const symbolsKey = site.ticker.symbols.map((s) => s.symbol).join(",");
    const cacheUrl = new URL(`https://retro-shell.cache/ticker?s=${encodeURIComponent(symbolsKey)}`);
    const cacheKey = new Request(cacheUrl.toString());
    const cache = caches.default;

    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const results = await Promise.all(
        site.ticker.symbols.map((s) => fetchOne(s.symbol, s.label)),
    );
    const entries = results.filter((r): r is TickerEntry => r !== null);

    const response = Response.json(
        { entries },
        {
            headers: {
                // Cloudflare edge cache and downstream caches honor this.
                "Cache-Control": `public, max-age=${site.ticker.refreshSeconds}`,
            },
        },
    );

    await cache.put(cacheKey, response.clone());
    return response;
}
