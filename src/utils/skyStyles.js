// CSS gradient placeholders for each sky condition.
// When a matching photo file exists, the browser uses it automatically;
// if not, it silently falls through to the gradient — no code changes needed.

export const SKY_GRADIENTS = {
  'clear-day':           'linear-gradient(to bottom, #1a6dd4 0%, #4ca5e8 60%, #f9d57a 85%, #f4913a 100%)',
  'clear-night':         'linear-gradient(to bottom, #0a0e2e 0%, #0d1a4a 50%, #1a2d6e 100%)',
  'partly-cloudy-day':   'linear-gradient(to bottom, #2176c4 0%, #5aaee0 55%, #c8dff5 80%, #e8c97a 100%)',
  'partly-cloudy-night': 'linear-gradient(to bottom, #0d1238 0%, #1a2455 60%, #2a3870 100%)',
  'cloudy':              'linear-gradient(to bottom, #4a5568 0%, #718096 50%, #a0aec0 100%)',
  'fog':                 'linear-gradient(to bottom, #718096 0%, #a0aec0 60%, #cbd5e0 100%)',
  'drizzle':             'linear-gradient(to bottom, #2d4a6b 0%, #4a7096 60%, #7a9ab5 100%)',
  'rain':                'linear-gradient(to bottom, #1a2e42 0%, #2d4a6b 50%, #3d6080 100%)',
  'thunderstorm':        'linear-gradient(to bottom, #0f1923 0%, #1a2535 50%, #2d3a4a 100%)',
  'snow':                'linear-gradient(to bottom, #6b7a8d 0%, #9eafc0 60%, #d8e4ee 100%)',
  'sleet':               'linear-gradient(to bottom, #4a5a6b 0%, #6b7d8e 60%, #9eafbf 100%)',
  'blizzard':            'linear-gradient(to bottom, #3d4d5e 0%, #7a8d9e 60%, #c5d5e4 100%)',
};

// Expected photo filenames. Drop a matching JPG into public/photos/ and the
// browser will use it automatically — the gradient is the CSS fallback.
export const SKY_PHOTOS = {
  'clear-day':           '/clearhorizon/photos/clear-day.jpg',
  'clear-night':         '/clearhorizon/photos/clear-night.jpg',
  'partly-cloudy-day':   '/clearhorizon/photos/partly-cloudy-day.jpg',
  'partly-cloudy-night': '/clearhorizon/photos/partly-cloudy-night.jpg',
  'cloudy':              '/clearhorizon/photos/cloudy.jpg',
  'fog':                 '/clearhorizon/photos/fog.jpg',
  'drizzle':             '/clearhorizon/photos/drizzle.jpg',
  'rain':                '/clearhorizon/photos/rain.jpg',
  'thunderstorm':        '/clearhorizon/photos/thunderstorm.jpg',
  'snow':                '/clearhorizon/photos/snow.jpg',
  'sleet':               '/clearhorizon/photos/sleet.jpg',
  'blizzard':            '/clearhorizon/photos/blizzard.jpg',
};

/**
 * Returns an inline style object for the HeroCard background.
 * Photo is listed first so the browser uses it when available;
 * gradient is the fallback when the photo file doesn't exist.
 */
export function getSkyStyle(skyKey) {
  const gradient = SKY_GRADIENTS[skyKey] ?? SKY_GRADIENTS['clear-day'];
  const photo = SKY_PHOTOS[skyKey] ?? SKY_PHOTOS['clear-day'];
  return {
    backgroundImage: `url('${photo}'), ${gradient}`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}
