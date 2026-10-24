import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '../auth/auth';
import { TrainingSetupStore } from '../training/training-setup';
import { ownPlanGuard, planRedirectGuard } from './plan.guards';

describe('plan guards', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  const run = (guard: CanActivateFn) =>
    TestBed.runInInjectionContext(() => guard({} as never, {} as never));
  const path = (result: unknown) => TestBed.inject(Router).serializeUrl(result as UrlTree);

  async function signInWithPlan(categoryId?: string): Promise<void> {
    await TestBed.inject(Auth).verifyOtp('email', 'member@yamiforge.com', '1234');
    if (categoryId) {
      TestBed.inject(TrainingSetupStore).save({
        categoryId,
        goalId: null,
        splitId: null,
        frequency: 3,
        week: [],
      });
    }
  }

  it('sends /dashboard to the member’s own plan page', async () => {
    await signInWithPlan('hiit-crossfit');
    expect(path(run(planRedirectGuard))).toBe('/dashboard/hiit-crossfit');
  });

  it('sends a member with no plan to setup', async () => {
    await signInWithPlan();
    expect(path(run(planRedirectGuard))).toBe('/setup');
  });

  it('only opens the plan page that belongs to the member', async () => {
    await signInWithPlan('hiit-crossfit');
    expect(run(ownPlanGuard('hiit-crossfit'))).toBe(true);
    expect(path(run(ownPlanGuard('strength')))).toBe('/dashboard/hiit-crossfit');
  });
});
