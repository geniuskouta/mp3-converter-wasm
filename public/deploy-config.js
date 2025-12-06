// Deployment Configuration
// Auto-detects deployment strategy:
// - If sw.js exists → uses Service Worker (GitHub Pages)
// - If sw.js doesn't exist → uses native headers (Netlify/Cloudflare/Vercel)

const SERVICE_WORKER_PATH = '/sw.js';

// Check if service worker file exists
async function checkServiceWorkerExists() {
  try {
    const response = await fetch(SERVICE_WORKER_PATH, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Initialize deployment strategy
export async function initDeployment() {
  // Auto-detect: check if sw.js exists
  const hasServiceWorker = await checkServiceWorkerExists();

  if (hasServiceWorker && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
        scope: '/'
      });

      console.log('[Deploy] Service Worker mode (GitHub Pages)');
      console.log('[Deploy] Service Worker registered:', registration.scope);

      // Wait for service worker to be ready before proceeding
      await navigator.serviceWorker.ready;
      console.log('[Deploy] Service Worker ready');

      return { mode: 'service-worker', registration };
    } catch (error) {
      console.error('[Deploy] Service Worker registration failed:', error);
      console.warn('[Deploy] Falling back to native headers mode');
      return { mode: 'headers' };
    }
  } else {
    console.log('[Deploy] Native headers mode (Netlify/Cloudflare/Vercel)');
    return { mode: 'headers' };
  }
}
