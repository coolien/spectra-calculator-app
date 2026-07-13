const BUILD_ID = "__SPECTRA_BUILD_ID__";
const CACHE_NAME = "__SPECTRA_CACHE_NAME__";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.png",
  "./flutter.js",
  "./flutter_bootstrap.js",
  "./main.dart.js",
  "./version.json",
  "./spectra_build.json",
  "./icons/Icon-192.png",
  "./icons/Icon-512.png",
  "./icons/Icon-maskable-192.png",
  "./icons/Icon-maskable-512.png",
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
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
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
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  if (isVersionedAppFile(requestUrl)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

function isVersionedAppFile(requestUrl) {
  return (
    requestUrl.pathname.endsWith("/index.html") ||
    requestUrl.pathname.endsWith("/flutter_bootstrap.js") ||
    requestUrl.pathname.endsWith("/main.dart.js") ||
    requestUrl.pathname.endsWith("/version.json") ||
    requestUrl.pathname.endsWith("/spectra_build.json") ||
    requestUrl.pathname.endsWith("/spectra_service_worker.js")
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
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    if (fallbackUrl) {
      return cache.match(fallbackUrl);
    }

    throw _;
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
