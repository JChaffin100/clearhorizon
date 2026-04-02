import { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';
const CARTO_TILES    = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const CARTO_ATTR     = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const ANIMATION_INTERVAL = 500; // ms per frame

export default function RadarTab({ coords, savedCities, defaultZoom = 9, isActive, onRefresh }) {
  const mapRef       = useRef(null);
  const leafletMap   = useRef(null);
  const layersRef    = useRef([]);
  const frameIdxRef  = useRef(0);
  const intervalRef  = useRef(null);
  const markerRef    = useRef(null);

  const [frames, setFrames]         = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying]       = useState(true);
  const [nowcastCount, setNowcastCount] = useState(0);

  // Initialize Leaflet once the tab becomes active
  useEffect(() => {
    if (!isActive || !coords || leafletMap.current) return;

    // Dynamic import so Leaflet SSR issues are avoided
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        center:     [coords.latitude, coords.longitude],
        zoom:       defaultZoom,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer(CARTO_TILES, {
        attribution:  CARTO_ATTR,
        subdomains:   'abcd',
        maxZoom:      19,
      }).addTo(map);

      // Pulsing location marker (CSS animation, not default Leaflet pin)
      const pulseIcon = L.divIcon({
        className: '',
        html: '<div class="radar-pulse"><div class="radar-pulse__dot"></div></div>',
        iconSize:   [20, 20],
        iconAnchor: [10, 10],
      });
      markerRef.current = L.marker([coords.latitude, coords.longitude], { icon: pulseIcon })
        .addTo(map);

      // Saved city markers
      savedCities?.forEach((city) => {
        const labelIcon = L.divIcon({
          className: 'radar-city-label',
          html: `<span>${city.name}</span>`,
          iconAnchor: [0, 0],
        });
        L.marker([city.latitude, city.longitude], { icon: labelIcon }).addTo(map);
      });

      leafletMap.current = map;
      fetchRadarFrames(L, map);
    });

    return () => {
      clearInterval(intervalRef.current);
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, [isActive, coords]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to default zoom every time the tab opens
  useEffect(() => {
    if (isActive && leafletMap.current) {
      leafletMap.current.setZoom(defaultZoom);
    }
  }, [isActive, defaultZoom]);

  // Re-center on coord change
  useEffect(() => {
    if (!leafletMap.current || !coords) return;
    leafletMap.current.setView([coords.latitude, coords.longitude], leafletMap.current.getZoom());
    if (markerRef.current) {
      markerRef.current.setLatLng([coords.latitude, coords.longitude]);
    }
  }, [coords]);

  async function fetchRadarFrames(L, map) {
    try {
      const res  = await fetch(RAINVIEWER_API);
      const data = await res.json();
      const past     = data.radar?.past ?? [];
      const nowcast  = data.radar?.nowcast ?? [];
      const allFrames = [...past, ...nowcast];

      setNowcastCount(nowcast.length);

      // Build a TileLayer for each frame (use path exactly as returned)
      const layers = allFrames.map((frame) => {
        const host = data.host || 'https://tilecache.rainviewer.com';
        const tileUrl = `${host}${frame.path}/512/{z}/{x}/{y}/2/1_1.png`;
        return L.tileLayer(tileUrl, {
          opacity: 0,
          zIndex:  10,
          tileSize: 512,
          zoomOffset: -1,
          updateWhenZooming: false,
          keepBuffer: 0,
          maxNativeZoom: 8,
          maxZoom: 18,
        });
      });

      layersRef.current = layers;
      setFrames(allFrames);

      // Show first frame
      if (layers.length > 0) {
        layers[0].addTo(map);
        layers[0].setOpacity(0.7);
        frameIdxRef.current = 0;
        setFrameIndex(0);
        startAnimation(layers, allFrames.length);
      }
    } catch (err) {
      console.error('Radar fetch failed:', err);
    }
  }

  function startAnimation(layers, total) {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const curr = frameIdxRef.current;
      const next = (curr + 1) % total;

      // Add the next layer to the map so Leaflet can fetch its tiles
      if (!leafletMap.current.hasLayer(layers[next])) {
        layers[next].addTo(leafletMap.current);
      }

      layers[curr]?.setOpacity(0);
      layers[next]?.setOpacity(0.7);

      // Remove the previously shown layer from the map so zooming doesn't trigger fetching for it
      const prev = (curr - 1 + total) % total;
      if (prev !== next && leafletMap.current.hasLayer(layers[prev])) {
        leafletMap.current.removeLayer(layers[prev]);
      }

      frameIdxRef.current = next;
      setFrameIndex(next);
    }, ANIMATION_INTERVAL);
  }

  function stopAnimation() {
    clearInterval(intervalRef.current);
  }

  const togglePlay = useCallback(() => {
    setPlaying((prev) => {
      const nowPlaying = !prev;
      if (nowPlaying && layersRef.current.length) {
        startAnimation(layersRef.current, layersRef.current.length);
      } else {
        stopAnimation();
      }
      return nowPlaying;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const jumpToFrame = useCallback((idx) => {
    const layers = layersRef.current;
    if (!layers.length) return;

    if (!leafletMap.current.hasLayer(layers[idx])) {
      layers[idx].addTo(leafletMap.current);
    }

    layers[frameIdxRef.current]?.setOpacity(0);

    // If jumping, let's also remove the current layer from map to free memory (unless it's the one we jumped to)
    if (frameIdxRef.current !== idx && leafletMap.current.hasLayer(layers[frameIdxRef.current])) {
      leafletMap.current.removeLayer(layers[frameIdxRef.current]);
    }

    layers[idx]?.setOpacity(0.7);
    frameIdxRef.current = idx;
    setFrameIndex(idx);
  }, []);

  const recenter = useCallback(() => {
    if (!leafletMap.current || !coords) return;
    leafletMap.current.setView([coords.latitude, coords.longitude]);
  }, [coords]);

  const zoomIn  = useCallback(() => leafletMap.current?.zoomIn(), []);
  const zoomOut = useCallback(() => leafletMap.current?.zoomOut(), []);

  const handleRefresh = useCallback(() => {
    if (leafletMap.current) {
      import('leaflet').then((L) => {
        layersRef.current.forEach(layer => leafletMap.current.removeLayer(layer));
        layersRef.current = [];
        fetchRadarFrames(L, leafletMap.current);
      });
    }
    onRefresh?.();
  }, [onRefresh]);

  // Frame timestamp label
  function frameLabel(idx) {
    const frame = frames[idx];
    if (!frame) return '';
    const pastCount = frames.length - nowcastCount;
    if (idx >= pastCount) {
      const minutesAhead = (idx - pastCount + 1) * 10;
      return `+${minutesAhead} min`;
    }
    const d = new Date(frame.time * 1000);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const pastCount = frames.length - nowcastCount;

  return (
    <div className="radar-tab" aria-label="Animated weather radar map">
      {/* Leaflet map container */}
      <div ref={mapRef} className="radar-tab__map" />

      {/* Overlay controls */}
      <div className="radar-controls" aria-label="Radar controls">

        {/* Zoom buttons — top right */}
        <div className="radar-controls__zoom">
          <button className="radar-btn" onClick={zoomIn}  aria-label="Zoom in">+</button>
          <button className="radar-btn" onClick={zoomOut} aria-label="Zoom out">−</button>
        </div>

        {/* My Location — top right below zoom */}
        <div className="radar-controls__locate">
          <button className="radar-btn" onClick={recenter} aria-label="Re-center on my location" style={{ marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <line x1="12" y1="2"  x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="2"  y1="12" x2="6"  y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
            </svg>
          </button>
          
          {/* Refresh radar and weather */}
          <button className="radar-btn" onClick={handleRefresh} aria-label="Refresh radar and weather" title="Refresh">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
        </div>

        {/* Bottom controls: timeline + play/pause */}
        <div className="radar-controls__bottom">
          {/* Frame timestamp */}
          {frames.length > 0 && (
            <div className="radar-controls__timestamp" aria-live="polite">
              {frameLabel(frameIndex)}
            </div>
          )}

          {/* Timeline dots */}
          {frames.length > 0 && (
            <div className="radar-controls__timeline" role="group" aria-label="Radar timeline">
              {frames.map((_, i) => (
                <button
                  key={i}
                  className={`radar-dot${i === frameIndex ? ' radar-dot--active' : ''}${i >= pastCount ? ' radar-dot--nowcast' : ''}`}
                  onClick={() => jumpToFrame(i)}
                  aria-label={frameLabel(i)}
                  aria-pressed={i === frameIndex}
                />
              ))}
            </div>
          )}

          {/* Play / Pause */}
          <button
            className="radar-btn radar-btn--play"
            onClick={togglePlay}
            aria-label={playing ? 'Pause radar animation' : 'Play radar animation'}
          >
            {playing ? (
              // Pause icon
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              // Play icon
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
