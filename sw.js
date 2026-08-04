/* Balanço — service worker
   Troque o número da VERSAO sempre que publicar uma alteração:
   isso força o app a baixar a versão nova no celular. */
const VERSAO = 'balanco-1.1.0';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icone-192.png',
  './icone-512.png',
  './icone-maskable.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Firebase e Google sempre direto da rede: os dados precisam estar frescos
  if (url.hostname.includes('firebase') || url.hostname.includes('google') || url.hostname.includes('gstatic')) return;
  if (e.request.method !== 'GET') return;

  // rede primeiro, cache como reserva quando estiver sem internet
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(VERSAO).then(c => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
