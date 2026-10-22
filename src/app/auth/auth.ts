import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Member {
  username: string;
  name: string;
}

export type OtpMethod = 'email' | 'phone';

interface Account {
  username: string;
  phone: string; // digits only
  email: string; // lower case
}

export type OtpRequestResult = { ok: true } | { ok: false; error: 'not-found' };
export type RegisterResult =
  | { ok: true }
  | { ok: false; error: 'username-taken' | 'phone-taken' | 'email-taken' };

const STORAGE_KEY = 'yamiforge.session';
const ACCOUNTS_KEY = 'yamiforge.accounts';

// No backend yet, so every code is this one. It is never shown on screen.
const DEMO_OTP = '1234';

// No backend yet: these accounts stand in for a real API call.
const DEMO_ACCOUNTS: ReadonlyArray<Account> = [
  { username: 'member', phone: '9876543210', email: 'member@yamiforge.com' },
  { username: 'coach', phone: '9123456780', email: 'coach@yamiforge.com' },
];

/** Keeps digits only, so "+91 98765-43210" and "9876543210" are the same number. */
export const normalizePhone = (value: string): string => value.replace(/\D/g, '').slice(-10);
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _member = signal<Member | null>(this.restore());

  readonly member = this._member.asReadonly();
  readonly isLoggedIn = computed(() => this._member() !== null);

  /** "Sends" a code to an existing account's email or phone. */
  async requestOtp(method: OtpMethod, identifier: string): Promise<OtpRequestResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.find(method, identifier) ? { ok: true } : { ok: false, error: 'not-found' };
  }

  /** Resolves with the member when the code is right, or null when it is not. */
  async verifyOtp(method: OtpMethod, identifier: string, otp: string): Promise<Member | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const account = this.find(method, identifier);
    if (!account || otp.trim() !== DEMO_OTP) {
      return null;
    }
    return this.startSession(account);
  }

  /** Creates an account. The member then signs in with a code like everyone else. */
  async register(username: string, phone: string, email: string): Promise<RegisterResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const handle = username.trim().toLowerCase();
    const digits = normalizePhone(phone);
    const mail = normalizeEmail(email);
    const accounts = this.accounts();
    if (accounts.some((a) => a.username === handle)) {
      return { ok: false, error: 'username-taken' };
    }
    if (accounts.some((a) => a.phone === digits)) {
      return { ok: false, error: 'phone-taken' };
    }
    if (accounts.some((a) => a.email === mail)) {
      return { ok: false, error: 'email-taken' };
    }
    const account: Account = { username: handle, phone: digits, email: mail };
    this.writeAccounts([...this.storedAccounts(), account]);
    return { ok: true };
  }

  private find(method: OtpMethod, identifier: string): Account | undefined {
    return this.accounts().find((a) =>
      method === 'email'
        ? a.email === normalizeEmail(identifier)
        : a.phone === normalizePhone(identifier),
    );
  }

  logout(): void {
    this._member.set(null);
    this.write(null);
  }

  private startSession(account: Account): Member {
    const member: Member = { username: account.username, name: account.username };
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
