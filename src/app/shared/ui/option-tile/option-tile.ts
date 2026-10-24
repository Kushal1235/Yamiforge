import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WorkoutArt } from '../workout-art/workout-art';

/** A selectable illustrated card, used for workout styles and goals. */
@Component({
  selector: 'app-option-tile',
  imports: [WorkoutArt],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--i]': 'index()' },
  templateUrl: './option-tile.html',
  styleUrl: './option-tile.scss',
})
export class OptionTile {
  readonly art = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly meta = input<string>();
  readonly chip = input<string>();
  readonly selected = input(false);
  /** Position in the grid, used to stagger the entrance animation. */
  readonly index = input(0);
  readonly picked = output<void>();
}
