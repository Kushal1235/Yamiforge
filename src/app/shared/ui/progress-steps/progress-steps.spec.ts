import { TestBed } from '@angular/core/testing';
import { ProgressSteps } from './progress-steps';

describe('ProgressSteps', () => {
  it('draws one dot per step and marks done and current ones', () => {
    const fixture = TestBed.createComponent(ProgressSteps);
    fixture.componentRef.setInput('count', 4);
    fixture.componentRef.setInput('current', 2);
    fixture.detectChanges();

    const dots: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('li'));
    expect(dots).toHaveLength(4);
    expect(dots.map((d) => d.classList.contains('done'))).toEqual([true, true, false, false]);
    expect(dots[2].classList.contains('current')).toBe(true);
  });
});
