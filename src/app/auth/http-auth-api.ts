import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthApi } from './auth-api';
import {
  Member,
  OtpMethod,
  OtpRequestResult,
  RegisterResult,
  VerifyResult,
} from './auth.models';

const BASE = '/api/auth';
const CONFLICTS = ['username-taken', 'phone-taken', 'email-taken'] as const;

const statusOf = (error: unknown): number | undefined =>
  error instanceof HttpErrorResponse ? error.status : undefined;

/** Talks to the Spring Boot API. The session is an httpOnly cookie, so nothing is stored here. */
@Injectable()
export class HttpAuthApi extends AuthApi {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  async me(): Promise<Member | null> {
    try {
      return await firstValueFrom(this.http.get<Member>(`${BASE}/me`).pipe(timeout(5000)));
    } catch {
      return null;
    }
  }

  async requestOtp(method: OtpMethod, identifier: string): Promise<OtpRequestResult> {
    try {
      await this.seedCsrf();
      await firstValueFrom(this.http.post<void>(`${BASE}/otp/request`, { method, identifier }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: statusOf(error) === 404 ? 'not-found' : 'unavailable' };
    }
  }

  async verifyOtp(method: OtpMethod, identifier: string, otp: string): Promise<VerifyResult> {
    try {
      await this.seedCsrf();
      const member = await firstValueFrom(
        this.http.post<Member>(`${BASE}/otp/verify`, { method, identifier, otp }),
      );
      return { ok: true, member };
    } catch (error) {
      return { ok: false, error: statusOf(error) === 401 ? 'wrong-code' : 'unavailable' };
    }
  }

  async register(username: string, phone: string, email: string): Promise<RegisterResult> {
    try {
      await this.seedCsrf();
      await firstValueFrom(this.http.post<void>(`${BASE}/register`, { username, phone, email }));
      return { ok: true };
    } catch (error) {
      const code = error instanceof HttpErrorResponse ? error.error?.error : undefined;
      const conflict = CONFLICTS.find((c) => c === code);
      return { ok: false, error: statusOf(error) === 409 && conflict ? conflict : 'unavailable' };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.seedCsrf();
      await firstValueFrom(this.http.post<void>(`${BASE}/logout`, {}));
      await this.me(); // logging out clears the CSRF cookie; this sets a fresh one for the next sign-in
    } catch {
      // The member is already signed out locally; a failed call just leaves the cookie to expire.
    }
  }

  /**
   * Writes need the XSRF-TOKEN cookie, which the server sets on any request. Normally the
   * startup `me()` call has done it; this covers a server that was down then, or a cleared cookie.
   */
  private async seedCsrf(): Promise<void> {
    if (!/(?:^|;\s*)XSRF-TOKEN=/.test(this.document.cookie)) {
      await this.me();
    }
  }
}
