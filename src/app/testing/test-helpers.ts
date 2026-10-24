import { TestBed } from '@angular/core/testing';
import { Auth } from '../auth/auth';
import { TrainingSetupStore } from '../training/training-setup';
import { PlanDay } from '../training/training-options';

export const SAMPLE_WEEK: PlanDay[] = [
  { day: 'Mon', title: 'Push', rest: false },
  { day: 'Tue', title: 'Rest & recovery', rest: true },
  { day: 'Wed', title: 'Pull', rest: false },
  { day: 'Thu', title: 'Rest & recovery', rest: true },
  { day: 'Fri', title: 'Legs', rest: false },
  { day: 'Sat', title: 'Rest & recovery', rest: true },
  { day: 'Sun', title: 'Rest & recovery', rest: true },
];

/** Signs in as the demo member and saves a plan for the given workout style. */
export async function signInWithPlan(categoryId: string): Promise<void> {
  await TestBed.inject(Auth).verifyOtp('email', 'member@yamiforge.com', '1234');
  TestBed.inject(TrainingSetupStore).save({
    categoryId,
    goalId: null,
    splitId: null,
    frequency: 3,
    week: SAMPLE_WEEK,
  });
}
