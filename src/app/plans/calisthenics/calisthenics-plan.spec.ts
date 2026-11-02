import { provideFakeAuth } from '../../testing/fake-auth-api';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signInWithPlan } from '../../testing/test-helpers';
import { CalisthenicsPlan } from './calisthenics-plan';

describe('CalisthenicsPlan', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideFakeAuth()] });
  });
  afterEach(() => localStorage.clear());

  it('renders its own headline, three principles and the saved week', async () => {
    await signInWithPlan('calisthenics');
    const fixture = TestBed.createComponent(CalisthenicsPlan);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')?.textContent?.trim()).toBeTruthy();
    expect(el.querySelectorAll('.principles ol li')).toHaveLength(3);
    expect(el.querySelectorAll('app-week-plan li')).toHaveLength(7);
  });

  it('shows the selected day\'s exercises and keeps later levels locked', async () => {
    await signInWithPlan('calisthenics');
    const fixture = TestBed.createComponent(CalisthenicsPlan);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('.exercises li')).toHaveLength(5);
    const days = el.querySelectorAll<HTMLButtonElement>('.day');
    days[2].click(); // Wednesday is a recovery day
    fixture.detectChanges();
    expect(el.querySelectorAll('.exercises li')).toHaveLength(0);
    expect(el.querySelector('.rest-note')).toBeTruthy();

    const levels = el.querySelectorAll<HTMLButtonElement>('.level');
    expect(levels[0].disabled).toBe(false);
    expect(levels[1].disabled).toBe(true);
    expect(levels[2].disabled).toBe(true);
  });
});
