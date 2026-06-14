import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { queryClient } from '@/lib/queryClient';
import { routeTree } from './routeTree.gen';

import './index.css';
import './styles/app.css';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // GitHub Pages deploys under /travel-route/.
  basepath: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);

// Offline support — register the app-shell + tile cache in production only.
// In dev the cache would serve a stale bundle over the dev server, so instead we
// tear down any service worker still controlling localhost.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    if ('caches' in window) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}
