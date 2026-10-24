import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Auth } from '../auth/auth';
import { TrainingSetupStore } from '../training/training-setup';
import { Setup } from './setup';

describe('Setup', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(Auth).verifyOtp('email', 'member@yamiforge.com', '1234');
  });
  afterEach(() => localStorage.clear());

  function open() {
    const fixture = TestBed.createComponent(Setup);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const pick = (label: string) => {
      const target = Array.from(el.querySelectorAll<HTMLButtonElement>('button[role=radio]')).find(
        (b) => b.textContent?.includes(label),
      );
      expect(target, label).toBeDefined();
      target!.click();
      fixture.detectChanges();
    };
    return { fixture, el, pick };
  }

  it('starts by asking which workout, with all five styles', () => {
    const { el } = open();
    expect(el.querySelector('h1')?.textContent).toContain('workout');
    expect(el.querySelectorAll('app-option-tile')).toHaveLength(5);
  });

  it('asks strength and bodybuilding for a goal and then a split', () => {
    const { el, pick } = open();
    pick('Strength Training');
    expect(el.querySelector('h1')?.textContent).toContain('goal');
    pick('Gain weight');
    expect(el.querySelectorAll('app-split-card')).toHaveLength(5);
    pick('Push / Pull / Legs');
    expect(el.querySelector('h1')?.textContent).toContain('week');
    expect(el.querySelectorAll('app-week-plan li')).toHaveLength(7);
  });

  it('changes the background to the chosen workout and restores the gym scene on Back', () => {
    const { el, pick, fixture } = open();
    const background = () => el.querySelector('app-backdrop img')?.getAttribute('src');
    expect(background()).toBe('images/backgrounds/gym-baki.webp');

    pick('Powerlifting');
    expect(background()).toBe('images/workouts/powerlifting.jpg');

    el.querySelector<HTMLButtonElement>('button.ghost')!.click();
    fixture.detectChanges();
    expect(background()).toBe('images/backgrounds/gym-baki.webp');
  });

  it('recommends the splits that suit the chosen goal', () => {
    const { el, pick } = open();
    pick('Bodybuilding');
    pick('Lose weight');
    expect(el.querySelectorAll('.badge')).toHaveLength(2);
  });

  it('sends every other workout straight to a suggested week', () => {
    const { el, pick } = open();
    pick('HIIT & CrossFit');
    expect(el.querySelector('h1')?.textContent).toContain('week');
    const titles = Array.from(el.querySelectorAll<HTMLInputElement>('app-week-plan input'))
      .filter((i) => !i.disabled)
      .map((i) => i.value);
    expect(titles).toEqual([
      'HIIT · Sprint intervals',
      'CrossFit · Strength & skills',
      'HIIT · Circuit finisher',
      'CrossFit · Workout of the day',
    ]);
  });

  it('saves the plan for the signed-in member and opens the dashboard', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { el, pick, fixture } = open();
    pick('HIIT & CrossFit');
    el.querySelector<HTMLButtonElement>('button.primary')!.click();
    fixture.detectChanges();

    const saved = TestBed.inject(TrainingSetupStore).setup();
    expect(saved?.categoryId).toBe('hiit-crossfit');
    expect(saved?.goalId).toBeNull();
    expect(saved?.frequency).toBe(4);
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('lets a member with a saved plan leave without changing it', () => {
    const store = TestBed.inject(TrainingSetupStore);
    store.save({ categoryId: 'strength', goalId: null, splitId: null, frequency: 3, week: [] });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { el } = open();
    el.querySelector<HTMLButtonElement>('button.keep')!.click();
    expect(navigate).toHaveBeenCalledWith('/dashboard');
    expect(store.setup()?.categoryId).toBe('strength');
  });
});
