import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthApi } from './auth-api';
import {
  Member,
  OtpMethod,
  OtpRequestResult,
  RegisterResult,
  VerifyResult,
} from './auth.models';

export * from './auth.models';

/** Who is signed in. The server owns the session; this holds what the UI reads from it. */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(AuthApi);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _member = signal<Member | null>(null);

  readonly member = this._member.asReadonly();
  readonly isLoggedIn = computed(() => this._member() !== null);

  /** Asks the server who the session cookie belongs to. Runs once, before the first route. */
  async restore(): Promise<void> {
    if (this.isBrowser) {
      this._member.set(await this.api.me());
    }
  }

  /** Sends a code to an existing account's email or phone. */
  requestOtp(method: OtpMethod, identifier: string): Promise<OtpRequestResult> {
    return this.api.requestOtp(method, identifier);
  }

  /** Signs in when the code is right. */
  async verifyOtp(method: OtpMethod, identifier: string, otp: string): Promise<VerifyResult> {
    const result = await this.api.verifyOtp(method, identifier, otp);
    if (result.ok) {
      this._member.set(result.member);
    }
    return result;
  }

  /** Creates an account. The member then signs in with a code like everyone else. */
  register(username: string, phone: string, email: string): Promise<RegisterResult> {
    return this.api.register(username, phone, email);
  }

  /** Signs out here straight away, then tells the server to end the session. */
  async logout(): Promise<void> {
    this._member.set(null);
    await this.api.logout();
  }
}
