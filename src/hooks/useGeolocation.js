import { useState, useEffect, useCallback } from 'react';

export function useGeolocation() {
  const [state, setState] = useState({
    coords: null,
    error: null,
    loading: false,
    permissionState: 'prompt', // 'prompt' | 'granted' | 'denied'
  });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by this browser.' }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          error: null,
          loading: false,
          permissionState: 'granted',
        });
      },
      (err) => {
        const msg =
          err.code === 1
            ? 'Location access denied. Add a city manually.'
            : 'Unable to retrieve your location.';
        setState({
          coords: null,
          error: msg,
          loading: false,
          permissionState: err.code === 1 ? 'denied' : 'prompt',
        });
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  // Auto-request on mount
  useEffect(() => {
    // Check permission state first if the API is available
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          request();
        } else if (result.state === 'denied') {
          setState((s) => ({
            ...s,
            permissionState: 'denied',
            error: 'Location access denied. Add a city manually.',
          }));
        } else {
          // 'prompt' — request so the browser shows the permission dialog
          request();
        }
      }).catch(() => request());
    } else {
      request();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, request };
}
