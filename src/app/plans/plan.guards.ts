import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TrainingSetupStore } from '../training/training-setup';

/** Sends /dashboard to the member's own plan page, or to setup when they have none. */
export const planRedirectGuard: CanActivateFn = () => {
  const categoryId = inject(TrainingSetupStore).setup()?.categoryId;
  const router = inject(Router);
  return router.createUrlTree(categoryId ? ['/dashboard', categoryId] : ['/setup']);
};

/** A plan page only opens for the member whose saved plan it is. */
export const ownPlanGuard =
  (categoryId: string): CanActivateFn =>
  () => {
    const saved = inject(TrainingSetupStore).setup()?.categoryId;
    return saved === categoryId
      ? true
      : inject(Router).createUrlTree(saved ? ['/dashboard', saved] : ['/setup']);
  };
