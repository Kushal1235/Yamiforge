import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlanShell } from '../plan-shell/plan-shell';

/** Strength plan page. */
@Component({
  selector: 'app-strength-plan',
  imports: [PlanShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './strength-plan.html',
  styleUrl: './strength-plan.scss',
})
export class StrengthPlan {
  protected readonly headline = 'Get stronger, rep by rep';
  protected readonly blurb =
    'Heavy, simple lifts done well. Your week is built around a few big movements that you load up gradually.';
  protected readonly principles = [
    'Build every session around squat, press, hinge and pull patterns.',
    'Add weight in small steps, only when every rep felt solid.',
    'Rest two to three minutes between heavy sets and keep form strict.',
  ];
}
