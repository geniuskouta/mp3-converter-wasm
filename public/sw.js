// Service Worker for GitHub Pages deployment
// This intercepts .wasm file requests and sets the correct Content-Type header
// because GitHub Pages doesn't allow custom MIME types via _headers file

const WASM_MIME_TYPE = 'application/wasm';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  // Take control of all pages immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept .wasm files
  if (url.pathname.endsWith('.wasm')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to avoid consuming it
          const clonedResponse = response.clone();

          // Create new headers with correct Content-Type
          const headers = new Headers(clonedResponse.headers);
          headers.set('Content-Type', WASM_MIME_TYPE);

          // Return new response with corrected headers
          // NOTE: We don't cache anything to avoid cache invalidation issues
          return new Response(clonedResponse.body, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: headers
          });
        })
        .catch(error => {
          console.error('[Service Worker] Fetch failed for', url.pathname, error);
          throw error;
        })
    );
  }
  // For all other requests, pass through without modification
});
