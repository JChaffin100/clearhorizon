# ClearHorizon

A clean, lightweight personal weather Progressive Web App with animated radar — inspired by Google Weather's design. Powered entirely by free, no-key APIs. No backend, no database, no account required.

## Features

- **Current conditions** — temperature, feels-like, high/low, condition label, and a dynamic sky background that matches the weather and time of day
- **16-day daily forecast** — tappable rows that update the hourly view
- **24-hour carousel** — scrollable per-hour cards with precipitation probability bars
- **Condition cards** — wind, humidity, UV index, pressure, sunrise/sunset, precipitation, visibility, dew point, moon phase, and AQI
- **Hourly graphs** — expandable SVG sparklines for precipitation, wind, and humidity
- **Animated radar** — full-screen Leaflet map with RainViewer past + nowcast frames, timeline scrubber, and play/pause controls
- **Multiple locations** — up to 10 saved cities with drag-to-reorder, plus GPS "My Location"
- **Auto-refresh** — fresh data fetched on every app open and tab visibility restore
- **Offline fallback** — cached data always shown; never a blank screen
- **Light / Dark / System themes**
- **Imperial and metric units**
- **PWA** — installable on iOS, Android, and desktop; works offline
- **Export / import preferences** as CSV

## Screenshots

> *(Screenshots coming soon — add yours here)*

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Weather API | [Open-Meteo](https://open-meteo.com) (forecast, geocoding, air quality) |
| Radar | [RainViewer](https://www.rainviewer.com) |
| Base map tiles | [CartoDB Dark Matter](https://carto.com/basemaps) via OpenStreetMap |
| Mapping library | [Leaflet](https://leafletjs.com) 1.9 |
| Drag-to-reorder | [SortableJS](https://sortablejs.com) |
| Icon generation | [sharp](https://sharp.pixelplumbing.com) |
| Deployment | GitHub Pages via [gh-pages](https://github.com/tschaub/gh-pages) or GitHub Actions |
| Styling | Vanilla CSS with custom properties (no CSS framework) |

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later

### Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/clearhorizon.git
cd clearhorizon
npm install
```

### Generate PWA icons

This step must be run at least once before the first build. It converts `clearhorizon_icon.svg` into all required PNG sizes in `public/icons/`.

```bash
npm run generate-icons
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:5173/clearhorizon/](http://localhost:5173/clearhorizon/) in your browser.

### Build for production

```bash
npm run build
```

The production bundle is output to `dist/`.

### Preview the production build

```bash
npm run preview
```

Serves the production build locally at [http://localhost:4173/clearhorizon/](http://localhost:4173/clearhorizon/).

---

## Deployment

### Manual deploy to GitHub Pages

Requires the [gh-pages](https://github.com/tschaub/gh-pages) package (included as a dev dependency).

```bash
npm run deploy
```

This builds the app and pushes `dist/` to the `gh-pages` branch.

**One-time setup in your GitHub repository:**

1. Go to **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Select branch: `gh-pages`, folder: `/ (root)`
4. Click **Save**

Your app will be live at `https://YOUR_USERNAME.github.io/clearhorizon/`.

### Automatic deploy with GitHub Actions

The workflow at `.github/workflows/deploy.yml` automatically builds and deploys to GitHub Pages on every push to `main`.

**One-time setup:**

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Ensure **Actions** have write permission: **Settings → Actions → General → Workflow permissions → Read and write permissions**

After that, any push to `main` triggers a deploy automatically.

---

## Adding Sky Condition Photos

The HeroCard uses CSS gradients as placeholders. To add real photos, simply drop JPEG files into `public/photos/` matching the exact filenames below. No code changes are required — the browser automatically prefers the photo over the gradient.

| Filename | Condition |
|---|---|
| `clear-day.jpg` | Clear sky, daytime |
| `clear-night.jpg` | Clear sky, nighttime |
| `partly-cloudy-day.jpg` | Partly cloudy, daytime |
| `partly-cloudy-night.jpg` | Partly cloudy, nighttime |
| `cloudy.jpg` | Overcast |
| `fog.jpg` | Fog |
| `drizzle.jpg` | Drizzle |
| `rain.jpg` | Rain |
| `thunderstorm.jpg` | Thunderstorm |
| `snow.jpg` | Snow |
| `sleet.jpg` | Freezing rain / sleet |
| `blizzard.jpg` | Heavy snow / blizzard |

**Recommended dimensions:** minimum 1200 × 800 px, landscape orientation. See `public/photos/README-PHOTOS.md` for details.

---

## Regenerating Icons

If you update `clearhorizon_icon.svg`, regenerate all PWA icon sizes with:

```bash
npm run generate-icons
```

Then rebuild and redeploy.

---

## Preferences CSV Format

Preferences can be exported and imported from **Settings → Data**.

### Format

```csv
setting,value
version,1.0
units,imperial
theme,system
radarDefaultZoom,9
savedCities,"Springfield MO US|37.2090|-93.2923|America/Chicago,Chicago IL US|41.8781|-87.6298|America/Chicago"
```

- `units`: `imperial` or `metric`
- `theme`: `system`, `light`, or `dark`
- `radarDefaultZoom`: integer 6–13
- `savedCities`: comma-separated entries, each in the format `display_name|latitude|longitude|timezone`

---

## Versioning

The version string lives in **exactly one place**: `const VERSION = '1.0.0'` at the top of `public/sw.js`.

To bump the version:
1. Open `public/sw.js`
2. Change `const VERSION = '1.0.0'` to the new version string
3. Rebuild and redeploy

All in-app version references (Settings → About) read the version from the active service worker at runtime via `postMessage` — no other files need updating.

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge (desktop & Android) | Full, including PWA install |
| Safari (iOS 16.4+) | Full PWA support via Add to Home Screen |
| Safari (macOS) | Full |
| Firefox | Full (no PWA install prompt) |
| Samsung Internet | Full, including PWA install |

---

## Data Credits

- **Weather data** — [Open-Meteo](https://open-meteo.com) — free, open-source, no API key required
- **Radar tiles** — [RainViewer](https://www.rainviewer.com) — free tier, no API key required
- **Map tiles** — [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright) · [© CARTO](https://carto.com/attributions)

---

## License

MIT — see [LICENSE](LICENSE) for details.
