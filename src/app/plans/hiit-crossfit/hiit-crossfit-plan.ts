import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlanShell } from '../plan-shell/plan-shell';

/** HIIT & CrossFit plan page. */
@Component({
  selector: 'app-hiit-crossfit-plan',
  imports: [PlanShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hiit-crossfit-plan.html',
  styleUrl: './hiit-crossfit-plan.scss',
})
export class HiitCrossfitPlan {
  protected readonly headline = 'Two styles, one week';
  protected readonly blurb =
    'Your week alternates short, hard HIIT days with CrossFit days that mix strength, skills and a workout of the day.';
  protected readonly principles = [
    'HIIT days are short intervals: push hard, then recover fully before the next round.',
    'CrossFit days start with strength and skill practice, then finish with a mixed workout of the day.',
    'Never stack two hard days back to back, and scale any session down when you need to.',
  ];
}
