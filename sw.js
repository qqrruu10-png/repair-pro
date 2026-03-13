// ⬆️ غيّر هذا الرقم في كل تحديث تنزله
const CACHE_VERSION = 'repairpro-v1.3.0';

const URLS = [
  '/repair-pro/',
  '/repair-pro/index.html',
  '/repair-pro/track.html',
  '/repair-pro/manifest.json',
  '/repair-pro/icon-192.png',
  '/repair-pro/icon-512.png'
];

// تثبيت الكاش الجديد
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(URLS))
      .then(() => self.skipWaiting())
  );
});

// حذف الكاش القديم تلقائياً
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Network first for HTML files (to get updates)
      if (e.request.url.endsWith('.html') || e.request.url.endsWith('/')) {
        return fetch(e.request)
          .then(res => {
            if (res && res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
            }
            return res;
          })
          .catch(() => cached);
      }
      // Cache first for other files
      return cached || fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
