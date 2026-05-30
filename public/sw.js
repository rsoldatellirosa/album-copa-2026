// Service worker do Álbum Copa 2026 (PWA)
// Cacheia o "shell" do app pra instalar e abrir offline.
// NÃO cacheia as chamadas ao Supabase (cross-origin) — dados sempre frescos.
const CACHE = "copa2026-v2";
const APP_SHELL = ["/", "/repetidas", "/faltam", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Só mexe em requisições do próprio site (deixa Supabase/CDN passarem direto).
  if (url.origin !== self.location.origin) return;

  // Navegação (abrir páginas): rede primeiro, cai pro cache se offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Estáticos do mesmo domínio: cache primeiro, atualiza em segundo plano.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
    )
  );
});
