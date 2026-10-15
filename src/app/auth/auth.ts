import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Member {
  username: string;
  name: string;
}

const STORAGE_KEY = 'yamiforge.session';

// No backend yet: these accounts stand in for a real API call.
const DEMO_ACCOUNTS: ReadonlyArray<Member & { password: string }> = [
  { username: 'member', password: 'forge123', name: 'Alex' },
  { username: 'coach', password: 'coach123', name: 'Coach Sam' },
];

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _member = signal<Member | null>(this.restore());

  readonly member = this._member.asReadonly();
  readonly isLoggedIn = computed(() => this._member() !== null);

  /** Resolves with the member on success, or null when the credentials are wrong. */
  async login(username: string, password: string): Promise<Member | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const account = DEMO_ACCOUNTS.find(
      (a) => a.username === username.trim().toLowerCase() && a.password === password,
    );
    if (!account) {
      return null;
    }
    const member: Member = { username: account.username, name: account.name };
    this._member.set(member);
    this.write(JSON.stringify(member));
    return member;
  }

  logout(): void {
    this._member.set(null);
    this.write(null);
  }

  private restore(): Member | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Member) : null;
    } catch {
      return null;
    }
  }

  private write(value: string | null): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      if (value === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {
      // Storage can be blocked (private mode); the in-memory session still works.
    }
  }
}
