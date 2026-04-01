// MangaVerse 2.0 — bump version to bust ALL old caches on phone
const CACHE = 'mangaverse-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/auth.js',
  '/discover.js',
  '/reader.js',
  '/creator.js',
  '/profile.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', e => {
  // Delete ALL old caches (v1, v2 etc.)
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first: always try fresh, fall back to cache
  // Skip Firebase/Cloudinary/Google requests (never cache those)
  const url = e.request.url;
  if (
    url.includes('firebase') ||
    url.includes('cloudinary') ||
    url.includes('googleapis') ||
    url.includes('gstatic') ||
    url.includes('fonts.google')
  ) {
    return; // browser handles these natively
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache fresh response
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
  );
});
