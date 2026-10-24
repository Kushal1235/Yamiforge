import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Split } from '../../../training/training-options';

/** A selectable weekly-split card. */
@Component({
  selector: 'app-split-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--i]': 'index()' },
  templateUrl: './split-card.html',
  styleUrl: './split-card.scss',
})
export class SplitCard {
  readonly split = input.required<Split>();
  readonly selected = input(false);
  readonly recommended = input(false);
  readonly index = input(0);
  readonly picked = output<void>();
}
