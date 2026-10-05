const CACHE_NAME = 'quantumflow-hft-v1';
const ASSETS = [
  './',
  './index.html',
  './styles/tokens.css',
  './styles/cyber-hft.css',
  './scripts/lob-engine.js',
  './scripts/hawkes-process.js',
  './scripts/quantum-diffuser.js',
  './scripts/canvas-hft.js',
  './scripts/terminal-cli.js',
  './scripts/app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
