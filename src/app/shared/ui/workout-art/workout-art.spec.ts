import { TestBed } from '@angular/core/testing';
import { CATEGORIES } from '../../../training/training-options';
import { WorkoutArt } from './workout-art';

describe('WorkoutArt', () => {
  it('draws an illustration for every workout style', () => {
    for (const { id } of CATEGORIES) {
      const fixture = TestBed.createComponent(WorkoutArt);
      fixture.componentRef.setInput('kind', id);
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg, id).not.toBeNull();
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
