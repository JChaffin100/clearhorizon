# Sky Condition Photos

Drop real sky photos into this folder to replace the CSS gradient placeholders in the HeroCard.
No code changes are required — the browser automatically prefers the photo over the gradient
when the file exists.

## Required filenames

| Filename                  | Condition          |
|---------------------------|--------------------|
| `clear-day.jpg`           | Clear sky, daytime |
| `clear-night.jpg`         | Clear sky, nighttime |
| `partly-cloudy-day.jpg`   | Partly cloudy, daytime |
| `partly-cloudy-night.jpg` | Partly cloudy, nighttime |
| `cloudy.jpg`              | Overcast / heavy clouds |
| `fog.jpg`                 | Fog or mist |
| `drizzle.jpg`             | Light drizzle |
| `rain.jpg`                | Rain |
| `thunderstorm.jpg`        | Thunderstorm |
| `snow.jpg`                | Snow |
| `sleet.jpg`               | Freezing rain / sleet |
| `blizzard.jpg`            | Heavy snow / blizzard |

## Recommended dimensions

**Minimum:** 1200 × 800 px
**Ideal:** 1600 × 1000 px or larger (the image is cropped with `background-size: cover`)

Use landscape orientation. The top-center of the image will be most prominently visible on mobile.

## File format

JPEG is recommended for best compression at these dimensions. WebP is also supported by all
modern browsers. Avoid PNG for photos (unnecessarily large).

## After adding photos

No build step is needed. If running locally with Vite, the dev server picks up new files
immediately (hard refresh may be needed). For production, rebuild and redeploy.
