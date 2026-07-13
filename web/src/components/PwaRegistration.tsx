'use client';

import { useEffect } from 'react';

export function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) {
        return;
      }
      refreshing = true;
      window.location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) {
            return;
          }

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      });
    });
  }, []);

  return null;
}
