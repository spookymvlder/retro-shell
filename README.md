# Retro Shell

A personal-website template that wraps your content in a fake late-90s / early-2000s
browser window — title bar, address bar, cluttered toolbars, system-tray clock,
the works. Built with [Astro](https://astro.build) and deployed to
[Cloudflare Workers](https://developers.cloudflare.com/workers/) with a D1-backed
guestbook, Pagefind site search, and a themable content area.

The shell is locked to a 13" laptop width (1280px max). Mobile is not supported yet.

## Quick start (local)

```sh
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Open `http://localhost:4321`. The guestbook needs a local D1 database to function
(see [Guestbook setup](#guestbook-setup)). Site search needs a production build
(`npm run build && npm run preview`) — Pagefind only generates its index post-build.

## Before publishing — checklist

The repo ships with placeholder values. Replace these before you go live:

- [ ] `astro.config.mjs` — set `site` to your real domain (used for Open Graph URLs).
- [ ] `src/site.config.ts` — `siteName`, `titleSuffix`, `description`, `weather.userAgent`,
      and the `YOUR_USERNAME` placeholders in the toolbar.
- [ ] `wrangler.jsonc` — `name` (Worker name), and the D1 `database_id` after creation.
- [ ] `public/og-image.png` — 1200×630 image for social previews. Until you provide
      one, sharing your site on social platforms shows a broken image.
- [ ] `public/favicon.svg` and `public/favicon.ico` — replace the Astro defaults.
- [ ] `public/icons/` — replace any toolbar icons you don't need with your own
      (keep filenames, or update `icon` values in `site.config.ts`).
- [ ] Edit `src/pages/about.astro` and `src/pages/contact.astro` with your info.
- [ ] Delete `src/pages/theme.astro` and `src/components/ThemeShowcase.astro` once
      you're done customizing the theme — they're just for reference.

## Configuration

Almost all of your content lives in [`src/site.config.ts`](src/site.config.ts):

- `siteName` / `titleSuffix` — shown in the title bar, address bar, and `<title>`.
- `description` / `ogImage` — defaults for `<meta>` and Open Graph tags. Each page
  can override via `<RetroShell description="…" ogImage="…">`.
- `toolbarRows` — array of arrays of buttons. Each inner array is one toolbar row.
  Each button is `{ href, label, icon, iconSize?, external? }`.
- `weather` — lat/lon, User-Agent, and country code for `api.weather.gov`. Set
  `enabled: false` to hide the widget. **Update the `userAgent` string** —
  weather.gov blocks generic ones.
- `clock` — toolbar-tray clock. `defaultTimezone`, `defaultFormat` (`12h` / `24h`),
  and the `timezoneOptions` shown on the Settings page.
- `search` — toggle the FindIt! search box (Pagefind-backed) and where it submits.
- `settings` — toggle the per-visitor settings page at `/settings`.
- `guestbook` — toggle, rate-limit knobs, length limits, entries per page.

## Adding pages

Drop `.astro` files into `src/pages/` and wrap their contents in
`<RetroShell title="Page name">…</RetroShell>`. See
[`src/pages/index.astro`](src/pages/index.astro) and
[`src/pages/about.astro`](src/pages/about.astro) for the pattern.

Pages that don't need server-side rendering should add `export const prerender = true`
to their frontmatter — they'll ship as plain HTML, bypass the Worker, and become
indexable by site search.

`<RetroShell>` props:

- `title` — page title (shows in title bar, `<title>`, and OG tags).
- `description` — per-page meta/OG description.
- `ogImage` — per-page OG image path.
- `searchKeywords` — extra terms (off-screen) to make this page findable in search.
- `variant` — `"page"` (default, themed personal-site look) or `"system"` (flat
  Win98 control-panel look). Use `system` for things like Settings or 404.

## Theme

The page-content area inside the browser uses CSS custom properties so you can
retheme everything from one place. Edit the `:root` block in
[`src/layouts/Layout.astro`](src/layouts/Layout.astro):

| Token                  | What it controls                |
| :--------------------- | :------------------------------ |
| `--page-bg`            | Page background color           |
| `--page-text`          | Body text color                 |
| `--page-muted`         | Muted/secondary text            |
| `--page-accent`        | Accent (heading underline, drop shadows, dates) |
| `--page-accent-soft`   | Accent background tint (callouts, code) |
| `--page-highlight`     | Highlight color (heading bg, link hover) |
| `--page-link`          | Link color                      |
| `--page-link-visited`  | Visited link color              |
| `--page-heading-font`  | Heading font stack              |
| `--page-body-font`     | Body font stack                 |

Visit `/theme` while developing for a live preview of every token plus the
reusable `.sticker` and `.news` components. Delete `src/pages/theme.astro` and
`src/components/ThemeShowcase.astro` before publishing.

The shell chrome (title bar, toolbar, taskbar, scrollbar) is intentionally
*not* themed — it stays Win98 so the contrast with the page content reads as
"a personal page rendered in an old browser."

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
- For production, set it as a Worker secret (see Deployment).

### 3. Local dev secrets

`.dev.vars` (gitignored) holds local-only values. Copy from `.dev.vars.example`:

```env
TURNSTILE_SECRET="1x0000000000000000000000000000000AA"
IP_HASH_SALT="run: openssl rand -hex 32"
```

The values in `.dev.vars.example` are Cloudflare's
[testing keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
that always pass — useful for local dev without setting up a real widget.

## Game Widget Setup
Disable either via enabled: false in config.
### Steam
1. Get an API key at steamcommunity.com/dev/apikey.
2. Npx wrangler secret put STEAM_API_KEY for prod, paste into .dev.vars for local.
3. Find your numeric ID at steamid.io and set steam.steamId in site.config.ts. Profile must be public.

### BGG
1. Set bgg.username to your BGG username (case-sensitive).


## Deployment

```sh
npm run build
npx wrangler deploy
npx wrangler secret put TURNSTILE_SECRET   # paste your real secret
npx wrangler secret put IP_HASH_SALT       # paste a long random string
```

The first `wrangler deploy` gives you a `*.workers.dev` URL. To point your own
domain at it, add a Custom Domain under **Workers → your-worker → Settings → Domains**.
Cloudflare handles DNS automatically if your domain is registered there.

If you don't want the public `*.workers.dev` URL exposed, disable it under
**Settings → Domains & Routes** after deploy.

## Project structure

```
src/
├── site.config.ts            ← edit this for most customization
├── env.d.ts                  ← types for Cloudflare bindings
├── lib/
│   └── userSettings.ts       ← localStorage helpers for the Settings page
├── layouts/
│   └── Layout.astro          ← <html>/<head>, OG tags, global theme tokens
├── components/
│   ├── RetroShell.astro      ← composes the browser window
│   ├── TitleBar.astro
│   ├── NavBar.astro          ← back/forward/home + address bar
│   ├── Toolbar.astro         ← renders rows from site.config
│   ├── ToolbarButton.astro
│   ├── ToolbarIcon.astro
│   ├── WeatherWidget.astro
│   ├── SearchForm.astro
│   ├── Taskbar.astro         ← Start button + system-tray clock
│   └── ThemeShowcase.astro   ← style guide demo (delete before publishing)
└── pages/
    ├── index.astro           (prerendered)
    ├── about.astro           (prerendered, stub)
    ├── contact.astro         (prerendered, stub)
    ├── projects.astro        (prerendered, stub)
    ├── theme.astro           (prerendered, delete before publishing)
    ├── settings.astro        (prerendered, system variant)
    ├── 404.astro             (prerendered, system variant)
    ├── search.astro          (SSR — reads ?q=)
    ├── guestbook.astro       (SSR — reads from D1)
    └── api/
        ├── weather.ts        (SSR — proxies api.weather.gov, accepts ?zip=)
        └── guestbook.ts      (SSR — POST handler with Turnstile + rate-limit)

migrations/
└── 0001_create_guestbook.sql
```

## Commands

| Command               | Action                                       |
| :-------------------- | :------------------------------------------- |
| `npm run dev`         | Local dev server at `localhost:4321`         |
| `npm run build`       | Build the Worker + assets, generate search index |
| `npm run preview`     | Preview the production build with Wrangler   |
| `npx wrangler deploy` | Deploy to Cloudflare Workers                 |

## Credits

Inspired by the [Neocities](https://neocities.org/) revival of personal homepages
and a vague memory of cluttered toolbars from Internet Explorer 5.

Licensed under the MIT License — see [LICENSE](LICENSE).
