// Service worker minimal: simpan halaman yang terakhir dibuka agar bisa dibaca saat offline.
const CACHE = "ld-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nama) => Promise.all(nama.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Halaman: jaringan dulu supaya data selalu terbaru, cadangan dari cache bila offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const salinan = res.clone();
          caches.open(CACHE).then((c) => c.put(req, salinan));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Aset statis berhash: cache dulu.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icon")) {
    e.respondWith(
      caches.match(req).then(
        (r) =>
          r ||
          fetch(req).then((res) => {
            const salinan = res.clone();
            caches.open(CACHE).then((c) => c.put(req, salinan));
            return res;
          }),
      ),
    );
  }
});
