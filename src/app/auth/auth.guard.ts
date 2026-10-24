import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TrainingSetupStore } from '../training/training-setup';
import { Auth } from './auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};

/** Keeps signed-in members off the login page. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.isLoggedIn() ? inject(Router).createUrlTree(['/dashboard']) : true;
};

/** Members with no saved plan pick a workout first; everyone else goes straight to their plan. */
export const setupGuard: CanActivateFn = () =>
  inject(TrainingSetupStore).hasSetup() ? true : inject(Router).createUrlTree(['/setup']);
