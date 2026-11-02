import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../../auth/auth';
import { FitnessLevel, LEVELS } from './calisthenics-program';

export interface ProgressState {
  /** Sessions logged per level. */
  sessions: Record<FitnessLevel, number>;
  /** Readiness checks ticked, as `<level>:<index>`. */
  checks: string[];
}

const EMPTY: ProgressState = {
  sessions: { beginner: 0, intermediate: 0, advanced: 0 },
  checks: [],
};

const storageKey = (username: string): string => `yamiforge.calisthenics.${username}`;

/**
 * A member's calisthenics progress. A level opens only when the previous level's session
 * count and every readiness check are met; elapsed time never unlocks anything.
 */
@Injectable({ providedIn: 'root' })
export class CalisthenicsProgress {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly auth = inject(Auth);
  private readonly changed = signal<Record<string, ProgressState>>({});

  readonly state = computed<ProgressState>(() => {
    const username = this.auth.member()?.username;
    if (!username) {
      return EMPTY;
    }
    return this.changed()[username] ?? this.read(username);
  });

  /** Levels the member may train: Beginner always, the rest once the one before is cleared. */
  readonly unlocked = computed<ReadonlySet<FitnessLevel>>(() => {
    const open = new Set<FitnessLevel>([LEVELS[0].id]);
    for (let i = 1; i < LEVELS.length; i++) {
      if (!this.isCleared(LEVELS[i - 1].id)) {
        break;
      }
      open.add(LEVELS[i].id);
    }
    return open;
  });

  isCleared(level: FitnessLevel): boolean {
    const rule = LEVELS.find((l) => l.id === level)?.unlockNext;
    if (!rule) {
      return false;
    }
    const state = this.state();
    return (
      state.sessions[level] >= rule.sessions &&
      rule.checks.every((_, i) => state.checks.includes(`${level}:${i}`))
    );
  }

  logSession(level: FitnessLevel): void {
    if (!this.unlocked().has(level)) {
      return;
    }
    const state = this.state();
    this.update({ ...state, sessions: { ...state.sessions, [level]: state.sessions[level] + 1 } });
  }

  toggleCheck(level: FitnessLevel, index: number): void {
    const state = this.state();
    const id = `${level}:${index}`;
    this.update({
      ...state,
      checks: state.checks.includes(id) ? state.checks.filter((c) => c !== id) : [...state.checks, id],
    });
  }

  private update(next: ProgressState): void {
    const username = this.auth.member()?.username;
    if (!username) {
      return;
    }
    this.changed.update((c) => ({ ...c, [username]: next }));
    if (this.isBrowser) {
      try {
        localStorage.setItem(storageKey(username), JSON.stringify(next));
      } catch {
        // Storage can be blocked (private mode); the in-memory progress still works.
      }
    }
  }

  private read(username: string): ProgressState {
    if (!this.isBrowser) {
      return EMPTY;
    }
    try {
      const raw = localStorage.getItem(storageKey(username));
      const parsed = raw ? (JSON.parse(raw) as Partial<ProgressState>) : null;
      return {
        sessions: { ...EMPTY.sessions, ...parsed?.sessions },
        checks: Array.isArray(parsed?.checks) ? parsed.checks : [],
      };
    } catch {
      return EMPTY;
    }
  }
}
