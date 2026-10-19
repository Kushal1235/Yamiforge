import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Member {
  username: string;
  name: string;
}

type Account = Member & { password: string };

export type RegisterResult = { ok: true; member: Member } | { ok: false; error: 'username-taken' };

const STORAGE_KEY = 'yamiforge.session';
const ACCOUNTS_KEY = 'yamiforge.accounts';

// No backend yet: these accounts stand in for a real API call.
const DEMO_ACCOUNTS: ReadonlyArray<Account> = [
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
    const account = this.accounts().find(
      (a) => a.username === username.trim().toLowerCase() && a.password === password,
    );
    if (!account) {
      return null;
    }
    return this.startSession(account);
  }

  /** Creates an account and signs the new member in. */
  async register(name: string, username: string, password: string): Promise<RegisterResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const handle = username.trim().toLowerCase();
    if (this.accounts().some((a) => a.username === handle)) {
      return { ok: false, error: 'username-taken' };
    }
    const account: Account = { username: handle, name: name.trim(), password };
    // Demo only: a real backend must hash passwords and never store them in the browser.
    this.writeAccounts([...this.storedAccounts(), account]);
    return { ok: true, member: this.startSession(account) };
  }

  logout(): void {
    this._member.set(null);
    this.write(null);
  }

  private startSession(account: Account): Member {
    const member: Member = { username: account.username, name: account.name };
    this._member.set(member);
    this.write(JSON.stringify(member));
    return member;
  }

  private accounts(): ReadonlyArray<Account> {
    return [...DEMO_ACCOUNTS, ...this.storedAccounts()];
  }

  private storedAccounts(): Account[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? (JSON.parse(raw) as Account[]) : [];
    } catch {
      return [];
    }
  }

  private writeAccounts(accounts: Account[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // Storage can be blocked (private mode); the account just won't be remembered.
    }
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
