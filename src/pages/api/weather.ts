import type { APIContext } from "astro";
import { site } from "../../site.config";

async function lookupZip(zip: string, country: string): Promise<{ lat: number; lon: number } | null> {
    try {
        const res = await fetch(`https://api.zippopotam.us/${country}/${encodeURIComponent(zip)}`);
        if (!res.ok) return null;
        const data = (await res.json()) as { places?: { latitude: string; longitude: string }[] };
        const place = data.places?.[0];
        if (!place) return null;
        return { lat: parseFloat(place.latitude), lon: parseFloat(place.longitude) };
    } catch {
        return null;
    }
}

export async function GET({ url }: APIContext) {
    const { userAgent, zipCountry } = site.weather;
    let lat = site.weather.lat;
    let lon = site.weather.lon;

    const zip = url.searchParams.get("zip");
    if (zip && /^[A-Za-z0-9 -]{3,10}$/.test(zip)) {
        const coords = await lookupZip(zip, zipCountry);
        if (coords) {
            lat = coords.lat;
            lon = coords.lon;
        }
    }

    const headers = {
        "User-Agent": userAgent,
        "Accept": "application/geo+json",
    };

    const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers });
    const pointData = await pointRes.json();
    const forecastUrl = pointData.properties.forecastHourly;

    const forecastRes = await fetch(forecastUrl, { headers });
    const forecastData = await forecastRes.json();
    const current = forecastData.properties.periods[0];

    return Response.json({
        temperature: current.temperature,
        unit: current.temperatureUnit,
        shortForecast: current.shortForecast,
        isDaytime: current.isDaytime,
    });
}
