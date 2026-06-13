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

// Offline support — caches the app shell + map tiles (see public/sw.js) so the
// installed PWA loads with no internet. Best-effort; the app still works online
// if registration fails.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
