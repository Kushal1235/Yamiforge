import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../auth/auth';
import {
  CATEGORIES,
  GOALS,
  Goal,
  PlanDay,
  SPLITS,
  Split,
  TrainingCategory,
  buildWeek,
} from './training-options';

export interface TrainingSetup {
  categoryId: string;
  /** Null for styles that don't use a weight goal. */
  goalId: string | null;
  /** Null for styles that don't use a weekly split. */
  splitId: string | null;
  frequency: number;
  week: PlanDay[];
}

export interface PlanSummary {
  category: TrainingCategory;
  goal?: Goal;
  split?: Split;
  days: number;
  week: PlanDay[];
}

// One saved plan per member, so a second account never sees the first one's plan.
const storageKey = (username: string): string => `yamiforge.setup.${username}`;

@Injectable({ providedIn: 'root' })
export class TrainingSetupStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly auth = inject(Auth);
  /** Plans saved or cleared in this page's lifetime; anything else is read from storage. */
  private readonly changed = signal<Record<string, TrainingSetup | null>>({});

  /** The signed-in member's plan, or null when they haven't picked one. */
  readonly setup = computed<TrainingSetup | null>(() => {
    const username = this.auth.member()?.username;
    if (!username) {
      return null;
    }
    const changed = this.changed();
    const setup = username in changed ? changed[username] : this.read(username);
    // A plan saved for a workout that no longer exists is treated as no plan.
    return setup && CATEGORIES.some((c) => c.id === setup.categoryId) ? setup : null;
  });
  readonly hasSetup = computed(() => this.setup() !== null);

  /** The saved plan with its style, goal and split looked up, ready for display. */
  readonly summary = computed<PlanSummary | null>(() => {
    const setup = this.setup();
    const category = CATEGORIES.find((c) => c.id === setup?.categoryId);
    if (!setup || !category) {
      return null;
    }
    return {
      category,
      goal: GOALS.find((g) => g.id === setup.goalId),
      split: SPLITS.find((s) => s.id === setup.splitId),
      days: setup.frequency,
      week: setup.week,
    };
  });

  save(setup: TrainingSetup): void {
    const username = this.auth.member()?.username;
    if (!username) {
      return;
    }
    this.changed.update((c) => ({ ...c, [username]: setup }));
    this.write(username, JSON.stringify(setup));
  }

  clear(): void {
    const username = this.auth.member()?.username;
    if (!username) {
      return;
    }
    this.changed.update((c) => ({ ...c, [username]: null }));
    this.write(username, null);
  }

  /** Suggested weekly plan: which day gets which workout, and which days are rest. */
  proposeWeek(categoryId: string, splitId: string | null): PlanDay[] {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    const split = category?.usesSplit ? SPLITS.find((s) => s.id === splitId) : undefined;
    return split
      ? buildWeek(split.sessions, split.days)
      : buildWeek(category?.sessions ?? ['Full-body session'], category?.days ?? 3);
  }

  private read(username: string): TrainingSetup | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const raw = localStorage.getItem(storageKey(username));
      return raw ? (JSON.parse(raw) as TrainingSetup) : null;
    } catch {
      return null;
    }
  }

  private write(username: string, value: string | null): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      if (value === null) {
        localStorage.removeItem(storageKey(username));
      } else {
        localStorage.setItem(storageKey(username), value);
      }
    } catch {
      // Storage can be blocked (private mode); the in-memory setup still works.
    }
  }
}
