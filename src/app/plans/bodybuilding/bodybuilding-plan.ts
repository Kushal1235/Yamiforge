import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlanShell } from '../plan-shell/plan-shell';

/** Bodybuilding plan page. */
@Component({
  selector: 'app-bodybuilding-plan',
  imports: [PlanShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bodybuilding-plan.html',
  styleUrl: './bodybuilding-plan.scss',
})
export class BodybuildingPlan {
  protected readonly headline = 'Build size and symmetry';
  protected readonly blurb =
    'Muscle growth comes from steady volume across the whole body, with controlled reps and good recovery.';
  protected readonly principles = [
    'Train each muscle group about twice a week where your split allows.',
    'Use controlled 6 to 12 rep sets, finishing a rep or two before failure.',
    'Progress by adding reps, load or better control, not by rushing.',
  ];
}
