import { useState, useMemo, useEffect } from 'react';
import { usePreferences } from './hooks/usePreferences.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useWeather }     from './hooks/useWeather.js';

import HeroCard            from './components/HeroCard.jsx';
import SevereWeatherBanner from './components/SevereWeatherBanner.jsx';
import HourlyCarousel      from './components/HourlyCarousel.jsx';
import DailyForecast       from './components/DailyForecast.jsx';
import ConditionCards      from './components/ConditionCards.jsx';
import HourlyGraphs        from './components/HourlyGraphs.jsx';
import RadarTab            from './components/RadarTab.jsx';
import LocationSwitcher    from './components/LocationSwitcher.jsx';
import SearchModal         from './components/SearchModal.jsx';
import SettingsPanel       from './components/SettingsPanel.jsx';
import InstallBanner       from './components/InstallBanner.jsx';

export default function App() {
  const { prefs, updatePrefs, addCity, removeCity, reorderCities, setActiveLocation, MAX_CITIES } =
    usePreferences();
  const { coords: gpsCoords, permissionState } = useGeolocation();

  // Active location coordinates
  const activeCoords = useMemo(() => {
    if (prefs.activeLocationIndex === -1 && gpsCoords) return gpsCoords;
    if (prefs.activeLocationIndex >= 0) {
      const city = prefs.savedCities[prefs.activeLocationIndex];
      if (city) return { latitude: city.latitude, longitude: city.longitude };
    }
    return gpsCoords; // fallback
  }, [prefs.activeLocationIndex, prefs.savedCities, gpsCoords]);

  // Active location display name
  const activeLocationName = useMemo(() => {
    if (prefs.activeLocationIndex === -1 && gpsCoords) return 'My Location';
    if (prefs.activeLocationIndex >= 0) {
      const city = prefs.savedCities[prefs.activeLocationIndex];
      if (city) return city.name;
    }
    if (gpsCoords) return 'My Location';
    return 'Add a Location';
  }, [prefs.activeLocationIndex, prefs.savedCities, gpsCoords]);

  const { weather, aqi, loading, isOffline, lastUpdated, refresh } =
    useWeather(activeCoords, prefs.units);

  // UI state
  const [activeTab,          setActiveTab]          = useState('forecast');
  const [selectedDayIndex,   setSelectedDayIndex]   = useState(0);
  const [locationOpen,       setLocationOpen]        = useState(false);
  const [searchOpen,         setSearchOpen]          = useState(false);
  const [settingsOpen,       setSettingsOpen]        = useState(false);

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (prefs.theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else if (prefs.theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
  }, [prefs.theme]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/clearhorizon/sw.js').catch(() => {});
    }
  }, []);

  // If no location is available at all, prompt user to add one
  const noLocation = !activeCoords;

  return (
    <div className="app">
      {/* Main content */}
      <main className="app__main">
        {/* ── FORECAST TAB ── */}
        <div
          className={`forecast-view${activeTab === 'forecast' ? ' forecast-view--active' : ''}`}
          aria-hidden={activeTab !== 'forecast'}
        >
          {noLocation ? (
            <div className="no-location-screen">
              <div className="no-location-screen__icon">🌤</div>
              <h1 className="no-location-screen__title">Welcome to ClearHorizon</h1>
              <p className="no-location-screen__subtitle">
                {permissionState === 'denied'
                  ? 'Location access denied. Add a city to get started.'
                  : 'Add a city or allow location access to see weather.'}
              </p>
              <button
                className="no-location-screen__btn"
                onClick={() => { setLocationOpen(true); }}
              >
                Add a Location
              </button>
            </div>
          ) : (
            <>
              <HeroCard
                weather={weather}
                units={prefs.units}
                locationName={activeLocationName}
                loading={loading}
                isOffline={isOffline}
                lastUpdated={lastUpdated}
                onRefresh={refresh}
                onLocationClick={() => setLocationOpen(true)}
                onSettingsClick={() => setSettingsOpen(true)}
              />

              {weather?.current && (
                <SevereWeatherBanner
                  weatherCode={weather.current.weather_code}
                  isDay={weather.current.is_day}
                />
              )}

              <div className="forecast-body">
                <HourlyCarousel
                  weather={weather}
                  selectedDayIndex={selectedDayIndex}
                />

                <DailyForecast
                  weather={weather}
                  selectedDayIndex={selectedDayIndex}
                  onDaySelect={(i) => setSelectedDayIndex(i)}
                />

                <ConditionCards
                  weather={weather}
                  aqi={aqi}
                  units={prefs.units}
                />

                <HourlyGraphs
                  weather={weather}
                  selectedDayIndex={selectedDayIndex}
                />
              </div>
            </>
          )}
        </div>

        {/* ── RADAR TAB ── */}
        <div
          className={`radar-view${activeTab === 'radar' ? ' radar-view--active' : ''}`}
          aria-hidden={activeTab !== 'radar'}
        >
          <RadarTab
            coords={activeCoords}
            savedCities={prefs.savedCities}
            defaultZoom={prefs.radarDefaultZoom}
            isActive={activeTab === 'radar'}
            onRefresh={refresh}
          />
        </div>
      </main>

      {/* ── BOTTOM TAB BAR ── */}
      <nav className="tab-bar" aria-label="App navigation">
        <button
          className={`tab-bar__item${activeTab === 'forecast' ? ' tab-bar__item--active' : ''}`}
          onClick={() => setActiveTab('forecast')}
          aria-current={activeTab === 'forecast' ? 'page' : undefined}
          aria-label="Forecast"
        >
          <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 15a4 4 0 0 0 4 4h9a5 5 0 0 0 1.8-9.7A7 7 0 1 0 3 15z"/>
          </svg>
          <span className="tab-bar__label">Forecast</span>
        </button>

        <button
          className={`tab-bar__item${activeTab === 'radar' ? ' tab-bar__item--active' : ''}`}
          onClick={() => setActiveTab('radar')}
          aria-current={activeTab === 'radar' ? 'page' : undefined}
          aria-label="Radar"
        >
          <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="2"/>
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
          </svg>
          <span className="tab-bar__label">Radar</span>
        </button>
      </nav>

      {/* ── OVERLAYS ── */}
      <LocationSwitcher
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        savedCities={prefs.savedCities}
        activeLocationIndex={prefs.activeLocationIndex}
        hasGPS={!!gpsCoords}
        onSelectGPS={() => setActiveLocation(-1)}
        onSelectCity={(i) => setActiveLocation(i)}
        onAddCity={() => { setLocationOpen(false); setSearchOpen(true); }}
      />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        atLimit={prefs.savedCities.length >= MAX_CITIES}
        onSelect={(city) => {
          addCity(city);
          setActiveLocation(prefs.savedCities.length); // select newly added city
        }}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        prefs={prefs}
        updatePrefs={updatePrefs}
        addCity={addCity}
        removeCity={removeCity}
        reorderCities={reorderCities}
        onAddCity={() => { setSettingsOpen(false); setSearchOpen(true); }}
        onRefreshWeather={refresh}
        MAX_CITIES={MAX_CITIES}
      />

      <InstallBanner />
    </div>
  );
}
