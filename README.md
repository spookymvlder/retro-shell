# Retro Shell

A personal-website template that wraps your content in a fake late-90s / early-2000s
browser window — title bar, address bar, cluttered toolbars, taskbar, the works.
Built with [Astro](https://astro.build).

The shell is locked to a 13" laptop width (1280px max). Mobile is not supported yet.

## Quick start

```sh
npm install
npm run dev
```

Open `http://localhost:4321`.

## Making it yours

Almost everything you'll want to change lives in [`src/site.config.ts`](src/site.config.ts):

- `siteName` — shown in the title bar and address bar (e.g. `"yoursite.com"`)
- `titleSuffix` — the right side of the `<title>` tag
- `toolbarRows` — an array of arrays of buttons. Each inner array is one row.
  Each button is `{ href, label, icon, iconSize?, external? }`.
- `weather` — lat/lon and the User-Agent string sent to api.weather.gov.
  Set `enabled: false` to hide the widget.
- `search` — toggle the FindIt! search box and set where it submits.

Replace the icon PNGs in `public/icons/` with your own (keep the same filenames,
or update `icon` values in the config to match new ones). Replace `public/favicon.*`
with your own favicon.

Add pages by dropping new `.astro` files into `src/pages/` and wrapping their
contents in `<RetroShell title="Page name">…</RetroShell>`. See
[`src/pages/index.astro`](src/pages/index.astro) for the pattern.

## Project structure

```
src/
├── site.config.ts        ← edit this
├── layouts/
│   └── Layout.astro      ← <html>/<head>, global styles
├── components/
│   ├── RetroShell.astro  ← composes the whole browser window
│   ├── TitleBar.astro
│   ├── NavBar.astro      ← back/forward/home + address bar
│   ├── Toolbar.astro     ← renders rows from site.config
│   ├── ToolbarButton.astro
│   ├── ToolbarIcon.astro
│   ├── WeatherWidget.astro
│   ├── SearchForm.astro
│   ├── FakeScrollbar.astro
│   └── Taskbar.astro
└── pages/
    ├── index.astro
    ├── projects.astro
    ├── search.astro
    └── api/
        └── weather.ts    ← proxies api.weather.gov using config lat/lon
```

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Local dev server at `localhost:4321`         |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview the production build locally         |
