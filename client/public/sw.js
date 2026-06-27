const CACHE_NAME = 'blogspace-v3'
const RUNTIME_CACHE = 'blogspace-runtime-v3'
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  if (request.url.includes('chrome-extension')) return

  const url = new URL(request.url)

  // API calls for blog articles — cache-first with network fallback,
  // so previously-read articles work offline
  if (url.pathname.includes('/api/blogs/') && !url.pathname.includes('/api/blogs/trending') && !url.pathname.includes('/api/blogs/featured')) {
    e.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        try {
          const networkResponse = await fetch(request)
          if (networkResponse.ok) cache.put(request, networkResponse.clone())
          return networkResponse
        } catch {
          const cached = await cache.match(request)
          if (cached) return cached
          return new Response(
            JSON.stringify({ success: false, message: 'You are offline and this article was not previously loaded.' }),
            { headers: { 'Content-Type': 'application/json' }, status: 503 }
          )
        }
      })
    )
    return
  }

  // Static assets and pages — network-first, cache fallback
  e.respondWith(
    fetch(request)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        return res
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
  )
})