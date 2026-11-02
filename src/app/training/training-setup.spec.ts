import { TestBed } from '@angular/core/testing';
import { Auth } from '../auth/auth';
import { provideFakeAuth } from '../testing/fake-auth-api';
import { TrainingSetupStore } from './training-setup';

describe('TrainingSetupStore', () => {
  const plan = { categoryId: 'hiit-crossfit', goalId: null, splitId: null, frequency: 3, week: [] };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: provideFakeAuth() });
  });
  afterEach(() => localStorage.clear());

  async function signIn(store: TrainingSetupStore, auth: Auth, username: string): Promise<void> {
    const email = username === 'member' ? 'member@yamiforge.com' : 'coach@yamiforge.com';
    await auth.verifyOtp('email', email, '123456');
    expect(auth.member()?.username).toBe(username);
    void store;
  }

  it('keeps each member’s plan separate', async () => {
    const auth = TestBed.inject(Auth);
    const store = TestBed.inject(TrainingSetupStore);

    await signIn(store, auth, 'member');
    store.save(plan);
    expect(store.hasSetup()).toBe(true);

    auth.logout();
    await signIn(store, auth, 'coach');
    expect(store.hasSetup()).toBe(false);

    auth.logout();
    await signIn(store, auth, 'member');
    expect(store.setup()?.categoryId).toBe('hiit-crossfit');
  });
});
