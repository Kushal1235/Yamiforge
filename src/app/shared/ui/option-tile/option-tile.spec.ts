import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionTile } from './option-tile';

describe('OptionTile', () => {
  let fixture: ComponentFixture<OptionTile>;
  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionTile);
    fixture.componentRef.setInput('art', 'strength');
    fixture.componentRef.setInput('title', 'Strength Training');
    fixture.detectChanges();
  });

  it('shows the title and only the optional text it was given', () => {
    expect(button().textContent).toContain('Strength Training');
    expect(fixture.nativeElement.querySelector('.chip')).toBeNull();

    fixture.componentRef.setInput('chip', 'Goal + split');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chip').textContent).toContain('Goal + split');
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
