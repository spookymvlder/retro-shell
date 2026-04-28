# Retro Shell

A personal-website template that wraps your content in a fake late-90s / early-2000s
browser window — title bar, address bar, cluttered toolbars, taskbar, the works.
Built with [Astro](https://astro.build) and deployed to
[Cloudflare Workers](https://developers.cloudflare.com/workers/) with a D1-backed
guestbook.

The shell is locked to a 13" laptop width (1280px max). Mobile is not supported yet.

## Quick start (local)

```sh
npm install
cp .dev.vars.example .dev.vars   # then edit if you want non-default values
npm run dev
```

Open `http://localhost:4321`. The guestbook will work end-to-end locally
once you create a local D1 database (see "Guestbook setup" below).

## Making it yours

Almost all of your content lives in [`src/site.config.ts`](src/site.config.ts):

- `siteName` / `titleSuffix` — shown in the title bar, address bar, and `<title>`
- `toolbarRows` — array of arrays of buttons. Each inner array is one toolbar row.
  Each button is `{ href, label, icon, iconSize?, external? }`.
- `weather` — lat/lon and User-Agent for `api.weather.gov`. `enabled: false` to hide.
- `search` — toggle the FindIt! search box and where it submits.
- `guestbook` — toggle, rate-limit knobs, length limits, entries per page.

Replace icons in `public/icons/` (keep filenames or update `icon` values in config).
Replace `public/favicon.*` with your own.

Add pages by dropping `.astro` files into `src/pages/` and wrapping their contents
in `<RetroShell title="Page name">…</RetroShell>`. See [`src/pages/index.astro`](src/pages/index.astro).

Pages that don't need server-side rendering should add `export const prerender = true`
to their frontmatter — they'll ship as plain HTML and bypass the Worker entirely.

## Guestbook setup

The guestbook needs a D1 database and Turnstile keys. Free on Cloudflare.

### 1. Create the D1 database

```sh
npx wrangler login
npx wrangler d1 create retro-shell-guestbook
```

Copy the `database_id` from the output into [`wrangler.jsonc`](wrangler.jsonc),
replacing `REPLACE_WITH_YOUR_DATABASE_ID`.

Apply the migration:

```sh
npx wrangler d1 migrations apply retro-shell-guestbook --local      # for dev
npx wrangler d1 migrations apply retro-shell-guestbook --remote     # for prod
```

### 2. Create a Turnstile site

At [dash.cloudflare.com → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile),
create a site. You'll get a **site key** (public) and a **secret key**.

- Paste the **site key** into `wrangler.jsonc` under `vars.PUBLIC_TURNSTILE_SITE_KEY`.
- Put the **secret key** in `.dev.vars` as `TURNSTILE_SECRET` for local dev.
- For production, set it as a Worker secret (next section).

### 3. Local dev secrets

`.dev.vars` (gitignored) holds local-only values. Copy from `.dev.vars.example`:

```env
TURNSTILE_SECRET="1x0000000000000000000000000000000AA"
IP_HASH_SALT="run: openssl rand -hex 32"
```

The Turnstile values shown in `.dev.vars.example` are Cloudflare's
[testing keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
that always pass — useful for local dev without setting up a real widget.

## Deployment

```sh
npm run build
npx wrangler deploy
npx wrangler secret put TURNSTILE_SECRET   # paste your real secret
npx wrangler secret put IP_HASH_SALT       # paste a long random string
```

The first `wrangler deploy` will give you a `*.workers.dev` URL. To point your own
domain at it, add a Custom Domain under **Workers → your-worker → Settings → Domains**.

## Project structure

```
src/
├── site.config.ts           ← edit this
├── env.d.ts                 ← types for Cloudflare bindings
├── layouts/
│   └── Layout.astro         ← <html>/<head>, global styles
├── components/
│   ├── RetroShell.astro     ← composes the browser window
│   ├── TitleBar.astro
│   ├── NavBar.astro         ← back/forward/home + address bar
│   ├── Toolbar.astro        ← renders rows from site.config
│   ├── ToolbarButton.astro
│   ├── ToolbarIcon.astro
│   ├── WeatherWidget.astro
│   ├── SearchForm.astro
│   ├── FakeScrollbar.astro
│   └── Taskbar.astro
└── pages/
    ├── index.astro          (prerendered)
    ├── projects.astro       (prerendered)
    ├── search.astro         (SSR — reads ?q=)
    ├── guestbook.astro      (SSR — reads from D1)
    └── api/
        ├── weather.ts       (SSR — proxies api.weather.gov)
        └── guestbook.ts     (SSR — POST handler with Turnstile + rate-limit)

migrations/
└── 0001_create_guestbook.sql
```

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm run dev`     | Local dev server at `localhost:4321`         |
| `npm run build`   | Build the Worker + assets to `./dist/`       |
| `npm run preview` | Preview the production build with Wrangler   |
| `npx wrangler deploy` | Deploy to Cloudflare Workers             |
