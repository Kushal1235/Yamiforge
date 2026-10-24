import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlanDay } from '../../../training/training-options';

export interface DayRename {
  index: number;
  title: string;
}

/** A seven-day plan. Editable while being set up, read-only on the plan page. */
@Component({
  selector: 'app-week-plan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './week-plan.html',
  styleUrl: './week-plan.scss',
})
export class WeekPlan {
  readonly week = input.required<ReadonlyArray<PlanDay>>();
  readonly editable = input(false);
  readonly renamed = output<DayRename>();
  readonly restToggled = output<number>();
}
