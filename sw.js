const scope = self.registration.scope;
const page = new URL("index.html", scope).href;
const prefix = "knight-club:" + scope + ":";
const cacheName = prefix + "b807c86723daa27738e6";

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.add(new Request(page, {cache: "reload"}));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(prefix) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;
  const url = new URL(request.url);
  const address = url.origin + url.pathname;
  if (address !== scope && address !== page) return;
  event.respondWith(fetch(request).catch(async () =>
    (await caches.match(page, {cacheName})) || Response.error()));
});
