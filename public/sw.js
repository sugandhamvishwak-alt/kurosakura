const CACHE_NAME = 'kurosakura-v2'; // bump this number every time you deploy changes (v3, v4...)
const urlsToCache = ['/', '/player.html'];

// Domains that must always hit the network fresh — never serve stale
const NEVER_CACHE = ['vidnest.fun', 'vidsrc.cc', 'graphql.anilist.co'];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // activate new SW immediately instead of waiting for tabs to close
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()) // take control of open tabs right away
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return; // don't touch POST (your AniList calls)
  if (NEVER_CACHE.some((host) => url.hostname.includes(host))) return; // video/API always fresh

  // Network-first for your own pages so you always get the latest deploy
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
