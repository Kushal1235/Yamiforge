import { Routes } from '@angular/router';
import { authGuard, guestGuard, setupGuard } from './auth/auth.guard';
import { planRedirectGuard } from './plans/plan.guards';
import { PLAN_ROUTES } from './plans/plan.routes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    title: 'Sign in · YamiForge',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'setup',
    title: 'Choose your workout · YamiForge',
    canActivate: [authGuard],
    loadComponent: () => import('./setup/setup').then((m) => m.Setup),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, setupGuard],
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      // /dashboard itself forwards to the member's own plan page.
      { path: '', pathMatch: 'full', canActivate: [planRedirectGuard], children: [] },
      ...PLAN_ROUTES,
    ],
  },
  { path: '**', redirectTo: 'login' },
];
