export interface Member {
  username: string;
  name: string;
}

export type OtpMethod = 'email' | 'phone';

/** `unavailable` covers anything the API contract does not name: network down, server error. */
export type OtpRequestResult = { ok: true } | { ok: false; error: 'not-found' | 'unavailable' };
export type VerifyResult =
  | { ok: true; member: Member }
  | { ok: false; error: 'wrong-code' | 'unavailable' };
export type RegisterResult =
  | { ok: true }
  | { ok: false; error: 'username-taken' | 'phone-taken' | 'email-taken' | 'unavailable' };

/** Keeps digits only, so "+91 98765-43210" and "9876543210" are the same number. */
export const normalizePhone = (value: string): string => value.replace(/\D/g, '').slice(-10);
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();
