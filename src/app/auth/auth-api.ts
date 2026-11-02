import {
  Member,
  OtpMethod,
  OtpRequestResult,
  RegisterResult,
  VerifyResult,
} from './auth.models';

/** What the app needs from the server. `HttpAuthApi` is the real one; tests use an in-memory fake. */
export abstract class AuthApi {
  /** The member the session cookie belongs to, or null. */
  abstract me(): Promise<Member | null>;
  abstract requestOtp(method: OtpMethod, identifier: string): Promise<OtpRequestResult>;
  abstract verifyOtp(method: OtpMethod, identifier: string, otp: string): Promise<VerifyResult>;
  abstract register(username: string, phone: string, email: string): Promise<RegisterResult>;
  abstract logout(): Promise<void>;
}
