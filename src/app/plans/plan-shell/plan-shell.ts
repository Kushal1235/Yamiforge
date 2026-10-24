import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WeekPlan } from '../../shared/ui/week-plan/week-plan';
import { WorkoutArt } from '../../shared/ui/workout-art/workout-art';
import { TrainingSetupStore } from '../../training/training-setup';

/**
 * The page layout every workout plan shares. Each plan component supplies its own words
 * (headline, summary, principles); the member's goal, split and week come from the store.
 */
@Component({
  selector: 'app-plan-shell',
  imports: [RouterLink, WeekPlan, WorkoutArt],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plan-shell.html',
  styleUrl: './plan-shell.scss',
})
export class PlanShell {
  readonly headline = input.required<string>();
  readonly blurb = input.required<string>();
  readonly principles = input.required<ReadonlyArray<string>>();

  private readonly store = inject(TrainingSetupStore);
  protected readonly summary = computed(() => this.store.summary());
}
