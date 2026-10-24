import { TestBed } from '@angular/core/testing';
import { Backdrop } from './backdrop';

describe('Backdrop', () => {
  function render(workout?: string) {
    const fixture = TestBed.createComponent(Backdrop);
    if (workout) {
      fixture.componentRef.setInput('workout', workout);
    }
    fixture.detectChanges();
    return fixture;
  }
  const img = (fixture: ReturnType<typeof render>): HTMLImageElement =>
    fixture.nativeElement.querySelector('img');

  it('shows the gym scene by default, hidden from screen readers', () => {
    const el = img(render());
    expect(el.getAttribute('src')).toBe('images/backgrounds/gym-baki.webp');
    expect(el.getAttribute('alt')).toBe('');
  });

  it('shows the picture of the chosen workout', () => {
    expect(img(render('powerlifting')).getAttribute('src')).toBe('images/workouts/powerlifting.jpg');
  });

  it('switches picture when the chosen workout changes', () => {
    const fixture = render('strength');
    expect(img(fixture).getAttribute('src')).toBe('images/workouts/strength.png');
    fixture.componentRef.setInput('workout', 'bodybuilding');
    fixture.detectChanges();
    expect(img(fixture).getAttribute('src')).toBe('images/workouts/bodybuilding.avif');
  });

  it('falls back to the gym scene for a workout with no picture', () => {
    expect(img(render('unknown')).getAttribute('src')).toBe('images/backgrounds/gym-baki.webp');
  });
});
