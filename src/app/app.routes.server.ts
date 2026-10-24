import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Session lives in the browser, so the member area can't be rendered ahead of time.
  { path: 'dashboard', renderMode: RenderMode.Client },
  { path: 'dashboard/**', renderMode: RenderMode.Client },
  { path: 'setup', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
