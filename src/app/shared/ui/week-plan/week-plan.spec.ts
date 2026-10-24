import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SAMPLE_WEEK } from '../../../testing/test-helpers';
import { WeekPlan } from './week-plan';

describe('WeekPlan', () => {
  let fixture: ComponentFixture<WeekPlan>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekPlan);
    fixture.componentRef.setInput('week', SAMPLE_WEEK);
    fixture.detectChanges();
  });

  it('lists all seven days as read-only text by default', () => {
    expect(fixture.nativeElement.querySelectorAll('li')).toHaveLength(7);
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Push');
  });

  it('dims rest days', () => {
    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('li'));
    expect(rows.map((r) => r.classList.contains('rest'))).toEqual([
      false, true, false, true, false, true, true,
    ]);
  });

  describe('when editable', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
    });

    it('emits a rename with the day index and new title', () => {
      const renames: unknown[] = [];
      fixture.componentInstance.renamed.subscribe((r) => renames.push(r));
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.value = 'Chest day';
      input.dispatchEvent(new Event('input'));
      expect(renames).toEqual([{ index: 0, title: 'Chest day' }]);
    });

    it('emits the day index when its rest button is pressed', () => {
      const toggled: number[] = [];
      fixture.componentInstance.restToggled.subscribe((i) => toggled.push(i));
      fixture.nativeElement.querySelectorAll('button')[2].click();
      expect(toggled).toEqual([2]);
    });

    it('disables the name field on rest days', () => {
      const inputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('input'));
      expect(inputs[1].disabled).toBe(true);
      expect(inputs[0].disabled).toBe(false);
    });
  });
});
