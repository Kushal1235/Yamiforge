import { TestBed } from '@angular/core/testing';
import { FAKE_OTP, provideFakeAuth } from '../testing/fake-auth-api';
import { Auth } from './auth';
import { AuthApi } from './auth-api';

describe('Auth', () => {
  describe('with the in-memory server', () => {
    const create = () => TestBed.inject(Auth);

    beforeEach(() => TestBed.configureTestingModule({ providers: provideFakeAuth() }));

    it('sends a code to a known email or phone and rejects unknown ones', async () => {
      const auth = create();
      expect(await auth.requestOtp('email', 'member@yamiforge.com')).toEqual({ ok: true });
      expect(await auth.requestOtp('phone', '98765 43210')).toEqual({ ok: true });
      expect(await auth.requestOtp('email', 'ghost@yamiforge.com')).toEqual({
        ok: false,
        error: 'not-found',
      });
    });

    it('signs in with the right code', async () => {
      const auth = create();
      const result = await auth.verifyOtp('email', '  Member@YamiForge.com ', FAKE_OTP);

      expect(result).toEqual({ ok: true, member: { username: 'member', name: 'member' } });
      expect(auth.member()?.username).toBe('member');
      expect(auth.isLoggedIn()).toBe(true);
    });

    it('accepts a phone number written with spaces or a country code', async () => {
      expect((await create().verifyOtp('phone', '+91 98765-43210', FAKE_OTP)).ok).toBe(true);
    });

    it('rejects a wrong code and unknown accounts', async () => {
      const auth = create();
      expect(await auth.verifyOtp('email', 'member@yamiforge.com', '000000')).toEqual({
        ok: false,
        error: 'wrong-code',
      });
      expect((await auth.verifyOtp('email', 'ghost@yamiforge.com', FAKE_OTP)).ok).toBe(false);
      expect(auth.isLoggedIn()).toBe(false);
    });

    it('registers a new member without signing them in, then lets them log in by OTP', async () => {
      const auth = create();
      const result = await auth.register('Sam99', '9000000001', 'Sam@Example.com');

      expect(result).toEqual({ ok: true });
      expect(auth.isLoggedIn()).toBe(false);
      expect((await auth.verifyOtp('phone', '9000000001', FAKE_OTP)).ok).toBe(true);
      expect(auth.member()?.username).toBe('sam99');
    });

    it('refuses a duplicate username, phone or email', async () => {
      const auth = create();
      expect(await auth.register('member', '9000000002', 'a@b.com')).toEqual({
        ok: false,
        error: 'username-taken',
      });
      expect(await auth.register('new1', '9876543210', 'a@b.com')).toEqual({
        ok: false,
        error: 'phone-taken',
      });
      expect(await auth.register('new2', '9000000003', 'member@yamiforge.com')).toEqual({
        ok: false,
        error: 'email-taken',
      });
    });

    it('signs out', async () => {
      const auth = create();
      await auth.verifyOtp('email', 'member@yamiforge.com', FAKE_OTP);
      await auth.logout();

      expect(auth.isLoggedIn()).toBe(false);
    });
  });

  describe('restoring a session', () => {
    const serverSays = (member: { username: string; name: string } | null) =>
      TestBed.configureTestingModule({
        providers: [{ provide: AuthApi, useValue: { me: async () => member } }],
      });

    it('signs the member in when the server recognises the session cookie', async () => {
      serverSays({ username: 'coach', name: 'coach' });
      const auth = TestBed.inject(Auth);
      await auth.restore();

      expect(auth.member()?.username).toBe('coach');
    });

    it('stays signed out when the server does not', async () => {
      serverSays(null);
      const auth = TestBed.inject(Auth);
      await auth.restore();

      expect(auth.isLoggedIn()).toBe(false);
    });
  });

  it('signs out in the UI straight away, without waiting for the server', async () => {
    let endSession!: () => void;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthApi,
          useValue: {
            verifyOtp: async () => ({ ok: true, member: { username: 'member', name: 'member' } }),
            logout: () => new Promise<void>((resolve) => (endSession = resolve)),
          },
        },
      ],
    });
    const auth = TestBed.inject(Auth);
    await auth.verifyOtp('email', 'member@yamiforge.com', FAKE_OTP);

    const done = auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
    endSession();
    await done;
  });
});
