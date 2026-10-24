import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlanShell } from '../plan-shell/plan-shell';

/** Calisthenics plan page. */
@Component({
  selector: 'app-calisthenics-plan',
  imports: [PlanShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calisthenics-plan.html',
  styleUrl: './calisthenics-plan.scss',
})
export class CalisthenicsPlan {
  protected readonly headline = 'Master your own bodyweight';
  protected readonly blurb =
    'Strength and control from push-ups to pull-ups, with skills practised while you are fresh.';
  protected readonly principles = [
    'Practise skills first, when you are fresh, then do your strength work.',
    'Progress through harder variations before adding more reps.',
    'Finish with core and mobility to keep joints happy.',
  ];
}
