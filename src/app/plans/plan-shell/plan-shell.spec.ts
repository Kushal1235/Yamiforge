import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signInWithPlan } from '../../testing/test-helpers';
import { PlanShell } from './plan-shell';

describe('PlanShell', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => localStorage.clear());

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(PlanShell);
    fixture.componentRef.setInput('headline', 'Be strong');
    fixture.componentRef.setInput('blurb', 'A blurb.');
    fixture.componentRef.setInput('principles', ['One', 'Two']);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('renders nothing when the signed-in member has no saved plan', () => {
    expect(render().querySelector('article')).toBeNull();
  });

  it('shows the plan text, the saved week and a way to change workout', async () => {
    await signInWithPlan('strength');
    const el = render();
    expect(el.textContent).toContain('Be strong');
    expect(el.textContent).toContain('Strength Training');
    expect(el.querySelectorAll('ol li')).toHaveLength(2);
    expect(el.querySelectorAll('app-week-plan li')).toHaveLength(7);
    expect(el.querySelector('a.change')?.getAttribute('href')).toBe('/setup');
  });
});
