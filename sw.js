'use strict';
// Service Worker: macht das Spiel offline verfügbar (PWA).
// Strategie: Netzwerk zuerst (Updates sofort wirksam), Cache als Offline-Fallback.
// Bei jedem Release VER erhöhen, damit alte Caches aufgeräumt werden.
const VER = 'zack-v3';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  './js/gfx.js', './js/sprites.js', './js/audio.js', './js/tts.js', './js/engine.js',
  './js/items.js', './js/rooms_a.js', './js/rooms_b.js', './js/guide.js', './js/main.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VER).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VER).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;          // Fonts & ElevenLabs-API: immer direkt
  e.respondWith((async () => {
    const cache = await caches.open(VER);
    try {
      const fresh = await fetch(e.request);
      if (fresh && fresh.ok) cache.put(e.request, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      if (cached) return cached;
      throw err;
    }
  })());
});
