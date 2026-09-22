const CACHE = "formsy-v10-nocors-sw";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./excel-export.js",
  "./excel-import.js",
  "./hr.js",
  "./cloud-sync.js",
  "./data/seed.js",
  "./exceljs.min.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./sy.jpg",
  "./octopus.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const dest = new URL(e.request.url);
  if (dest.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const net = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});
