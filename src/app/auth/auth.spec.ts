import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth', () => {
  const create = () => TestBed.inject(Auth);

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('logs in a known member and persists the session', async () => {
    const auth = create();
    const member = await auth.login('member', 'forge123');

    expect(member?.name).toBe('Alex');
    expect(auth.isLoggedIn()).toBe(true);
    expect(localStorage.getItem('yamiforge.session')).toContain('member');
  });

  it('ignores case and surrounding spaces in the username', async () => {
    expect(await create().login('  Member ', 'forge123')).not.toBeNull();
  });

  it('rejects a wrong password and unknown users', async () => {
    const auth = create();
    expect(await auth.login('member', 'nope-nope')).toBeNull();
    expect(await auth.login('ghost', 'forge123')).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('treats the password as case-sensitive', async () => {
    expect(await create().login('member', 'FORGE123')).toBeNull();
  });

  it('clears the session on logout', async () => {
    const auth = create();
    await auth.login('member', 'forge123');
    auth.logout();

    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('yamiforge.session')).toBeNull();
  });

  it('restores a saved session and survives corrupt storage', () => {
    localStorage.setItem('yamiforge.session', JSON.stringify({ username: 'coach', name: 'Coach Sam' }));
    expect(create().member()?.username).toBe('coach');

    TestBed.resetTestingModule();
    localStorage.setItem('yamiforge.session', '{not json');
    expect(create().isLoggedIn()).toBe(false);
  });
});
