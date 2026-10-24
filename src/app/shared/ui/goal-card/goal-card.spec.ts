import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GOALS } from '../../../training/training-options';
import { GoalCard } from './goal-card';

describe('GoalCard', () => {
  let fixture: ComponentFixture<GoalCard>;
  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCard);
    fixture.componentRef.setInput('goal', GOALS[0]);
    fixture.detectChanges();
  });

  it('shows the goal name, description and a drawn icon', () => {
    expect(button().textContent).toContain('Lose weight');
    expect(button().textContent).toContain(GOALS[0].blurb);
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('svg.icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('reflects the selected state for assistive tech', () => {
    expect(button().getAttribute('aria-checked')).toBe('false');
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    expect(button().getAttribute('aria-checked')).toBe('true');
  });

  it('emits picked when clicked', () => {
    let picks = 0;
    fixture.componentInstance.picked.subscribe(() => picks++);
    button().click();
    expect(picks).toBe(1);
  });
});
