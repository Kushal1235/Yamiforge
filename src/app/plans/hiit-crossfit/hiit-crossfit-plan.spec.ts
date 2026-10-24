import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signInWithPlan } from '../../testing/test-helpers';
import { HiitCrossfitPlan } from './hiit-crossfit-plan';

describe('HiitCrossfitPlan', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => localStorage.clear());

  it('renders its own headline, three principles and the saved week', async () => {
    await signInWithPlan('hiit-crossfit');
    const fixture = TestBed.createComponent(HiitCrossfitPlan);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')?.textContent?.trim()).toBeTruthy();
    expect(el.querySelectorAll('ol li')).toHaveLength(3);
    expect(el.querySelectorAll('app-week-plan li')).toHaveLength(7);
  });
});
