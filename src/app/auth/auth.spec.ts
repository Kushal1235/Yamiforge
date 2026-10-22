import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth', () => {
  const create = () => TestBed.inject(Auth);

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('sends a code to a known email or phone and rejects unknown ones', async () => {
    const auth = create();
    expect(await auth.requestOtp('email', 'member@yamiforge.com')).toEqual({ ok: true });
    expect(await auth.requestOtp('phone', '98765 43210')).toEqual({ ok: true });
    expect(await auth.requestOtp('email', 'ghost@yamiforge.com')).toEqual({
      ok: false,
      error: 'not-found',
    });
  });

  it('signs in with the right code and persists the session', async () => {
    const auth = create();
    const member = await auth.verifyOtp('email', '  Member@YamiForge.com ', '1234');

    expect(member?.username).toBe('member');
    expect(auth.isLoggedIn()).toBe(true);
    expect(localStorage.getItem('yamiforge.session')).toContain('member');
  });

  it('accepts a phone number written with spaces or a country code', async () => {
    expect(await create().verifyOtp('phone', '+91 98765-43210', '1234')).not.toBeNull();
  });

  it('rejects a wrong code and unknown accounts', async () => {
    const auth = create();
    expect(await auth.verifyOtp('email', 'member@yamiforge.com', '0000')).toBeNull();
    expect(await auth.verifyOtp('email', 'ghost@yamiforge.com', '1234')).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('registers a new member without signing them in, then lets them log in by OTP', async () => {
    const auth = create();
    const result = await auth.register('Sam99', '9000000001', 'Sam@Example.com');

    expect(result).toEqual({ ok: true });
    expect(auth.isLoggedIn()).toBe(false);
    expect(await auth.verifyOtp('phone', '9000000001', '1234')).not.toBeNull();
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

  it('clears the session on logout', async () => {
    const auth = create();
    await auth.verifyOtp('email', 'member@yamiforge.com', '1234');
    auth.logout();

    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('yamiforge.session')).toBeNull();
  });

  it('restores a saved session and survives corrupt storage', () => {
    localStorage.setItem('yamiforge.session', JSON.stringify({ username: 'coach', name: 'coach' }));
    expect(create().member()?.username).toBe('coach');

    TestBed.resetTestingModule();
    localStorage.setItem('yamiforge.session', '{not json');
    expect(create().isLoggedIn()).toBe(false);
  });
});
