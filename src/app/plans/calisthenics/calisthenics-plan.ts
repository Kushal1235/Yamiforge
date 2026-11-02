import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PlanShell } from '../plan-shell/plan-shell';
import { CalisthenicsProgress } from './calisthenics-progress';
import { FitnessLevel, LEVELS } from './calisthenics-program';

/** Calisthenics plan page: pick a level, pick a day, see that day's workout. */
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

  protected readonly levels = LEVELS;
  protected readonly progress = inject(CalisthenicsProgress);

  protected readonly levelId = signal<FitnessLevel>('beginner');
  /** Index into the week, Monday first; opens on the first training day. */
  protected readonly dayIndex = signal(0);

  protected readonly level = computed(() => LEVELS.find((l) => l.id === this.levelId()) ?? LEVELS[0]);
  protected readonly day = computed(() => this.level().week[this.dayIndex()]);
  protected readonly sessions = computed(() => this.progress.state().sessions);

  /** The first level not yet open: the one whose requirements are shown. */
  protected readonly nextLevel = computed(() => LEVELS.find((l) => !this.progress.unlocked().has(l.id)));
  /** The level before `nextLevel`, whose sessions and checks gate it. */
  protected readonly gate = computed(() => {
    const next = this.nextLevel();
    const from = next ? LEVELS[LEVELS.indexOf(next) - 1] : undefined;
    return from?.unlockNext ? { from, rule: from.unlockNext } : undefined;
  });

  /** Sessions counted towards the gate, capped at the target so the meter never overflows. */
  protected readonly gateDone = computed(() => {
    const g = this.gate();
    return g ? Math.min(this.sessions()[g.from.id], g.rule.sessions) : 0;
  });

  protected selectLevel(id: FitnessLevel): void {
    if (this.progress.unlocked().has(id)) {
      this.levelId.set(id);
    }
  }

  protected isChecked(level: FitnessLevel, index: number): boolean {
    return this.progress.state().checks.includes(`${level}:${index}`);
  }

  protected requirement(level: FitnessLevel): string {
    const prev = LEVELS[LEVELS.findIndex((l) => l.id === level) - 1];
    const target = prev?.unlockNext?.sessions ?? 0;
    return `${Math.min(this.sessions()[prev.id], target)} of ${target} ${prev.name} sessions`;
  }
}
