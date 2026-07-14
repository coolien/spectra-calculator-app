const BUILD_ID = "__SPECTRA_BUILD_ID__";
const CACHE_NAME = "__SPECTRA_CACHE_NAME__";

const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/spectra_build.json",
  "/spectra-ring-favicon.png",
  "/icons/spectra-ring-192.png",
  "/icons/spectra-ring-512.png",
  "/icons/spectra-ring-maskable-192.png",
  "/icons/spectra-ring-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("spectra-next-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/"));
    return;
  }

  if (isVersionedAppFile(requestUrl)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (requestUrl.pathname.startsWith("/_next/static/") || request.destination === "image") {
    event.respondWith(cacheFirst(request));
  }
});

function isVersionedAppFile(requestUrl) {
  return (
    requestUrl.pathname === "/" ||
    requestUrl.pathname.endsWith("/index.html") ||
    requestUrl.pathname.endsWith("/sw.js") ||
    requestUrl.pathname.endsWith("/spectra_build.json") ||
    requestUrl.pathname.endsWith("/manifest.webmanifest")
  );
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) {
        return fallback;
      }
    }

    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}
