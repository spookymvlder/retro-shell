import { site } from "../../site.config";

export async function GET() {
    const { lat, lon, userAgent } = site.weather;

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
    });
}
