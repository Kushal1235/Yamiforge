import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth/auth';
import {
  CATEGORIES,
  GOALS,
  PlanDay,
  SPLITS,
  Split,
  TrainingCategory,
} from '../training/training-options';
import { TrainingSetupStore } from '../training/training-setup';
import { Backdrop } from '../shared/ui/backdrop/backdrop';
import { GoalCard } from '../shared/ui/goal-card/goal-card';
import { OptionTile } from '../shared/ui/option-tile/option-tile';
import { ProgressSteps } from '../shared/ui/progress-steps/progress-steps';
import { SplitCard } from '../shared/ui/split-card/split-card';
import { DayRename, WeekPlan } from '../shared/ui/week-plan/week-plan';

type Step = 'category' | 'goal' | 'split' | 'review';

@Component({
  selector: 'app-setup',
  imports: [Backdrop, GoalCard, OptionTile, ProgressSteps, SplitCard, WeekPlan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
})
export class Setup {
  private readonly auth = inject(Auth);
  private readonly store = inject(TrainingSetupStore);
  private readonly router = inject(Router);

  protected readonly member = this.auth.member;
  protected readonly hasPlan = this.store.hasSetup;
  protected readonly categories = CATEGORIES;
  protected readonly goals = GOALS;

  protected readonly categoryId = signal<string | null>(null);
  protected readonly goalId = signal<string | null>(null);
  protected readonly splitId = signal<string | null>(null);
  protected readonly week = signal<PlanDay[]>([]);
  protected readonly step = signal<Step>('category');

  protected readonly category = computed<TrainingCategory | undefined>(() =>
    CATEGORIES.find((c) => c.id === this.categoryId()),
  );
  protected readonly goalName = computed(() => GOALS.find((g) => g.id === this.goalId())?.name);
  protected readonly splitName = computed(() => SPLITS.find((s) => s.id === this.splitId())?.name);
  protected readonly trainingDays = computed(() => this.week().filter((d) => !d.rest).length);

  /** Splits that suit the chosen goal come first and carry a "Recommended" badge. */
  protected readonly orderedSplits = computed(() => {
    const goal = this.goalId();
    const fits = (s: Split) => (goal !== null && s.goals.includes(goal) ? 0 : 1);
    return [...SPLITS].sort((a, b) => fits(a) - fits(b));
  });

  /** Only strength and bodybuilding ask for a goal and a split; the rest go straight to a plan. */
  protected readonly steps = computed<Step[]>(() =>
    this.category()?.usesSplit ? ['category', 'goal', 'split', 'review'] : ['category', 'review'],
  );
  protected readonly stepIndex = computed(() => this.steps().indexOf(this.step()));

  protected recommended(split: Split): boolean {
    const goal = this.goalId();
    return goal !== null && split.goals.includes(goal);
  }

  /** Picking an option moves on at once; there is no separate Continue to press. */
  protected pickCategory(id: string): void {
    if (this.categoryId() !== id) {
      this.goalId.set(null);
      this.splitId.set(null);
    }
    this.categoryId.set(id);
    this.advance();
  }

  protected pickGoal(id: string): void {
    this.goalId.set(id);
    this.advance();
  }

  protected pickSplit(id: string): void {
    this.splitId.set(id);
    this.advance();
  }

  protected back(): void {
    const previous = this.steps()[this.stepIndex() - 1];
    if (previous) {
      this.step.set(previous);
    }
  }

  protected rename({ index, title }: DayRename): void {
    this.week.update((week) => week.map((d, i) => (i === index ? { ...d, title } : d)));
  }

  protected toggleRest(index: number): void {
    this.week.update((week) =>
      week.map((d, i) =>
        i === index ? { ...d, rest: !d.rest, title: d.rest ? 'Workout' : 'Rest & recovery' } : d,
      ),
    );
  }

  protected async save(): Promise<void> {
    const usesSplit = this.category()?.usesSplit ?? false;
    this.store.save({
      categoryId: this.categoryId()!,
      goalId: usesSplit ? this.goalId() : null,
      splitId: usesSplit ? this.splitId() : null,
      frequency: this.trainingDays(),
      week: this.week(),
    });
    await this.router.navigateByUrl('/dashboard');
  }

  /** Leaves without saving, so the plan the member already had stays as it was. */
  protected async keepCurrent(): Promise<void> {
    await this.router.navigateByUrl('/dashboard');
  }

  protected async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  private advance(): void {
    const upcoming = this.steps()[this.stepIndex() + 1];
    if (upcoming === 'review') {
      this.week.set(this.store.proposeWeek(this.categoryId()!, this.splitId()));
    }
    if (upcoming) {
      this.step.set(upcoming);
    }
  }
}
