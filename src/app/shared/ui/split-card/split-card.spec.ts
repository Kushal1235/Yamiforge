import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SPLITS } from '../../../training/training-options';
import { SplitCard } from './split-card';

describe('SplitCard', () => {
  let fixture: ComponentFixture<SplitCard>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitCard);
    fixture.componentRef.setInput('split', SPLITS[0]);
    fixture.detectChanges();
  });

  it('shows the split name, its sessions and suggested days', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Push / Pull / Legs');
    expect(text).toContain('Push');
    expect(text).toContain('6 days a week');
  });

  it('shows the Recommended badge only when asked', () => {
    expect(fixture.nativeElement.querySelector('.badge')).toBeNull();
    fixture.componentRef.setInput('recommended', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.badge').textContent).toContain('Recommended');
  });

  it('emits picked when clicked', () => {
    let picks = 0;
    fixture.componentInstance.picked.subscribe(() => picks++);
    fixture.nativeElement.querySelector('button').click();
    expect(picks).toBe(1);
  });
});
