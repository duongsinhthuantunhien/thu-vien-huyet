/* Cache B4: nâng phiên bản này khi cập nhật website để bỏ cache giao diện cũ. */
const VERSION = 'huyet-100-fix3-mobile-20261105';
const CORE = 'huyet-core-' + VERSION;
const PICTURES = 'huyet-images-' + VERSION;
const CORE_FILES = ['./', './index.html', './style.css?v=7', './app.js?v=6', './data.json', './images/logo-huyet.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CORE).then(cache => cache.addAll(CORE_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('huyet-') && k !== CORE && k !== PICTURES)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;

  if (/\.(?:jpe?g|png|webp)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(PICTURES);
      const found = await cache.match(request);
      if (found) return found;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    })());
    return;
  }
  // Network-first cho HTML, CSS, JS và JSON: ưu tiên nội dung mới sau khi GitHub cập nhật.
  event.respondWith((async () => {
    try {
      const response = await fetch(request, {cache: 'no-store'});
      if (response.ok) {
        const cache = await caches.open(CORE);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      const cache = await caches.open(CORE);
      return (await cache.match(request)) ||
        (request.mode === 'navigate' ? (await cache.match('./index.html')) : undefined) || Response.error();
    }
  })());
});
