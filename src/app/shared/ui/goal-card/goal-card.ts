import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Goal } from '../../../training/training-options';

/** A selectable goal card: text on frosted glass, so the background picture shows through. */
@Component({
  selector: 'app-goal-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--i]': 'index()' },
  templateUrl: './goal-card.html',
  styleUrl: './goal-card.scss',
})
export class GoalCard {
  readonly goal = input.required<Goal>();
  readonly selected = input(false);
  readonly index = input(0);
  readonly picked = output<void>();
}
