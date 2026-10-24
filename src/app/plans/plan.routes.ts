import { Route } from '@angular/router';
import { ownPlanGuard } from './plan.guards';

/** One lazy-loaded component per workout style; the path is the training category id. */
export const PLAN_ROUTES: ReadonlyArray<Route> = [
  {
    path: 'strength',
    title: 'Strength plan · YamiForge',
    canActivate: [ownPlanGuard('strength')],
    loadComponent: () => import('./strength/strength-plan').then((m) => m.StrengthPlan),
  },
  {
    path: 'bodybuilding',
    title: 'Bodybuilding plan · YamiForge',
    canActivate: [ownPlanGuard('bodybuilding')],
    loadComponent: () => import('./bodybuilding/bodybuilding-plan').then((m) => m.BodybuildingPlan),
  },
  {
    path: 'calisthenics',
    title: 'Calisthenics plan · YamiForge',
    canActivate: [ownPlanGuard('calisthenics')],
    loadComponent: () => import('./calisthenics/calisthenics-plan').then((m) => m.CalisthenicsPlan),
  },
  {
    path: 'powerlifting',
    title: 'Powerlifting plan · YamiForge',
    canActivate: [ownPlanGuard('powerlifting')],
    loadComponent: () => import('./powerlifting/powerlifting-plan').then((m) => m.PowerliftingPlan),
  },
  {
    path: 'hiit-crossfit',
    title: 'HIIT & CrossFit plan · YamiForge',
    canActivate: [ownPlanGuard('hiit-crossfit')],
    loadComponent: () => import('./hiit-crossfit/hiit-crossfit-plan').then((m) => m.HiitCrossfitPlan),
  },
];
