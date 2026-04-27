export async function GET() {
    const lat = 47.205;
    const lon = -122.540;

    const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
        headers: {
            "User-Agent": "carlcarlcarl.com weather widget",
            "Accept": "application/geo+json",
        },
    });

    const pointData = await pointRes.json();
    const forecastUrl = pointData.properties.forecastHourly;

    const forecastRes = await fetch(forecastUrl, {
        headers: {
            "User-Agent": "carlcarlcarl.com weather widget",
            "Accept": "application/geo+json",
        },
    });

    const forecastData = await forecastRes.json();
    const current = forecastData.properties.periods[0];

    return Response.json({
        temperature: current.temperature,
        unit: current.temperatureUnit,
        shortForecast: current.shortForecast,
    });
}