// WMO Weather Interpretation Codes → label, skyKey, isSevere, iconKey
// skyKey: null means resolve from code + isDay at runtime

const CODE_MAP = {
  0:  { label: 'Clear sky',                skyKey: null,          isSevere: false, iconKey: 'clear'        },
  1:  { label: 'Mainly clear',             skyKey: null,          isSevere: false, iconKey: 'clear'        },
  2:  { label: 'Partly cloudy',            skyKey: null,          isSevere: false, iconKey: 'partly-cloudy' },
  3:  { label: 'Overcast',                 skyKey: 'cloudy',      isSevere: false, iconKey: 'cloudy'       },
  45: { label: 'Fog',                      skyKey: 'fog',         isSevere: false, iconKey: 'fog'          },
  48: { label: 'Icy fog',                  skyKey: 'fog',         isSevere: false, iconKey: 'fog'          },
  51: { label: 'Light drizzle',            skyKey: 'drizzle',     isSevere: false, iconKey: 'drizzle'      },
  53: { label: 'Moderate drizzle',         skyKey: 'drizzle',     isSevere: false, iconKey: 'drizzle'      },
  55: { label: 'Heavy drizzle',            skyKey: 'drizzle',     isSevere: false, iconKey: 'drizzle'      },
  56: { label: 'Freezing drizzle',         skyKey: 'sleet',       isSevere: true,  iconKey: 'sleet'        },
  57: { label: 'Heavy freezing drizzle',   skyKey: 'sleet',       isSevere: true,  iconKey: 'sleet'        },
  61: { label: 'Light rain',               skyKey: 'rain',        isSevere: false, iconKey: 'rain'         },
  63: { label: 'Moderate rain',            skyKey: 'rain',        isSevere: false, iconKey: 'rain'         },
  65: { label: 'Heavy rain',               skyKey: 'rain',        isSevere: false, iconKey: 'rain'         },
  66: { label: 'Freezing rain',            skyKey: 'sleet',       isSevere: true,  iconKey: 'sleet'        },
  67: { label: 'Heavy freezing rain',      skyKey: 'sleet',       isSevere: true,  iconKey: 'sleet'        },
  71: { label: 'Light snow',               skyKey: 'snow',        isSevere: false, iconKey: 'snow'         },
  73: { label: 'Moderate snow',            skyKey: 'snow',        isSevere: false, iconKey: 'snow'         },
  75: { label: 'Heavy snow',               skyKey: 'blizzard',    isSevere: false, iconKey: 'snow'         },
  77: { label: 'Snow grains',              skyKey: 'snow',        isSevere: false, iconKey: 'snow'         },
  80: { label: 'Light rain showers',       skyKey: 'rain',        isSevere: false, iconKey: 'rain'         },
  81: { label: 'Moderate rain showers',    skyKey: 'rain',        isSevere: false, iconKey: 'rain'         },
  82: { label: 'Heavy rain showers',       skyKey: 'rain',        isSevere: false, iconKey: 'rain'         },
  85: { label: 'Light snow showers',       skyKey: 'snow',        isSevere: false, iconKey: 'snow'         },
  86: { label: 'Heavy snow showers',       skyKey: 'blizzard',    isSevere: false, iconKey: 'snow'         },
  95: { label: 'Thunderstorm',             skyKey: 'thunderstorm',isSevere: true,  iconKey: 'thunderstorm' },
  96: { label: 'Thunderstorm with hail',   skyKey: 'thunderstorm',isSevere: true,  iconKey: 'thunderstorm' },
  99: { label: 'Thunderstorm with hail',   skyKey: 'thunderstorm',isSevere: true,  iconKey: 'thunderstorm' },
};

/**
 * Returns { label, skyKey, isSevere, iconKey } for a WMO code.
 * isDay: 1 = day, 0 = night (from Open-Meteo current.is_day)
 */
export function getWeatherInfo(code, isDay = 1) {
  const info = CODE_MAP[code] ?? {
    label: 'Unknown', skyKey: 'cloudy', isSevere: false, iconKey: 'cloudy',
  };

  let skyKey = info.skyKey;
  let iconKey = info.iconKey;

  if (skyKey === null) {
    // Codes 0, 1, 2 need day/night resolution
    if (code === 0 || code === 1) {
      skyKey = isDay ? 'clear-day' : 'clear-night';
      iconKey = isDay ? 'clear-day' : 'clear-night';
    } else {
      // code === 2
      skyKey = isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
      iconKey = isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    }
  }

  return { label: info.label, skyKey, isSevere: info.isSevere, iconKey };
}

export const SEVERE_CODES = new Set([56, 57, 66, 67, 75, 77, 95, 96, 99]);

export function isSevereCode(code) {
  return SEVERE_CODES.has(code);
}
