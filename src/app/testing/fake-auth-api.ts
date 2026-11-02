import { Provider } from '@angular/core';
import { AuthApi } from '../auth/auth-api';
import {
  Member,
  OtpMethod,
  OtpRequestResult,
  RegisterResult,
  VerifyResult,
  normalizeEmail,
  normalizePhone,
} from '../auth/auth.models';

/** Every code the fake "sends". */
export const FAKE_OTP = '123456';

interface Account {
  username: string;
  phone: string;
  email: string;
}

/** In-memory stand-in for the server, with two accounts that already exist. */
export class FakeAuthApi extends AuthApi {
  private readonly accounts: Account[] = [
    { username: 'member', phone: '9876543210', email: 'member@yamiforge.com' },
    { username: 'coach', phone: '9123456780', email: 'coach@yamiforge.com' },
  ];
  private session: Member | null = null;

  async me(): Promise<Member | null> {
    return this.session;
  }

  async requestOtp(method: OtpMethod, identifier: string): Promise<OtpRequestResult> {
    return this.find(method, identifier) ? { ok: true } : { ok: false, error: 'not-found' };
  }

  async verifyOtp(method: OtpMethod, identifier: string, otp: string): Promise<VerifyResult> {
    const account = this.find(method, identifier);
    if (!account || otp.trim() !== FAKE_OTP) {
      return { ok: false, error: 'wrong-code' };
    }
    this.session = { username: account.username, name: account.username };
    return { ok: true, member: this.session };
  }

  async register(username: string, phone: string, email: string): Promise<RegisterResult> {
    const handle = username.trim().toLowerCase();
    const digits = normalizePhone(phone);
    const mail = normalizeEmail(email);
    if (this.accounts.some((a) => a.username === handle)) {
      return { ok: false, error: 'username-taken' };
    }
    if (this.accounts.some((a) => a.phone === digits)) {
      return { ok: false, error: 'phone-taken' };
    }
    if (this.accounts.some((a) => a.email === mail)) {
      return { ok: false, error: 'email-taken' };
    }
    this.accounts.push({ username: handle, phone: digits, email: mail });
    return { ok: true };
  }

  async logout(): Promise<void> {
    this.session = null;
  }

  private find(method: OtpMethod, identifier: string): Account | undefined {
    return this.accounts.find((a) =>
      method === 'email'
        ? a.email === normalizeEmail(identifier)
        : a.phone === normalizePhone(identifier),
    );
  }
}

export const provideFakeAuth = (): Provider[] => [{ provide: AuthApi, useClass: FakeAuthApi }];
