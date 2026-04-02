import { useState, useEffect } from 'react';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSHint, setShowIOSHint]       = useState(false);
  const [visible, setVisible]               = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem('ch_install_dismissed')) return;

    if (isIOS() && isSafari()) {
      setShowIOSHint(true);
      setVisible(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('ch_install_dismissed', '1');
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="install-banner" role="banner">
      <div className="install-banner__content">
        <img
          src="/clearhorizon/icons/icon-72.png"
          alt=""
          className="install-banner__icon"
          width={36}
          height={36}
        />
        {showIOSHint ? (
          <span className="install-banner__text">
            Tap <strong>Share ↑</strong> then <strong>"Add to Home Screen"</strong> to install ClearHorizon
          </span>
        ) : (
          <span className="install-banner__text">
            Install ClearHorizon for the best experience
          </span>
        )}
      </div>
      <div className="install-banner__actions">
        {!showIOSHint && (
          <button className="install-banner__btn install-banner__btn--primary" onClick={install}>
            Install
          </button>
        )}
        <button className="install-banner__btn install-banner__btn--ghost" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
