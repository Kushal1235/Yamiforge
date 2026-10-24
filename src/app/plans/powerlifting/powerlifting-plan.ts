import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlanShell } from '../plan-shell/plan-shell';

/** Powerlifting plan page. */
@Component({
  selector: 'app-powerlifting-plan',
  imports: [PlanShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './powerlifting-plan.html',
  styleUrl: './powerlifting-plan.scss',
})
export class PowerliftingPlan {
  protected readonly headline = 'Chase a bigger squat, bench and deadlift';
  protected readonly blurb =
    'Each main lift gets its own focus day, with accessories to shore up weak points.';
  protected readonly principles = [
    'Practise the three competition lifts with crisp, repeatable technique.',
    'Keep most heavy work below your true maximum and track every set.',
    'Use accessory days to strengthen whatever limits your lifts.',
  ];
}
