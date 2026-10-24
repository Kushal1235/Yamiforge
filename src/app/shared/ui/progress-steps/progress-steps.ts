import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Row of dots showing how far through a multi-step flow the member is. */
@Component({
  selector: 'app-progress-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-steps.html',
  styleUrl: './progress-steps.scss',
})
export class ProgressSteps {
  readonly count = input.required<number>();
  /** Zero-based index of the current step. */
  readonly current = input.required<number>();

  protected readonly dots = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
