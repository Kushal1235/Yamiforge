import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Login } from './login';
import { Auth } from '../auth/auth';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let el: HTMLElement;
  let auth: Auth;
  let router: Router;

  const input = (id: string) => el.querySelector<HTMLInputElement>(`#${id}`)!;
  const type = (id: string, value: string) => {
    const field = input(id);
    field.value = value;
    field.dispatchEvent(new Event('input'));
  };
  // The Auth calls wait half a second like a real API, so the clock is faked and moved on.
  const submit = async () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await vi.advanceTimersByTimeAsync(600);
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const navButton = (label: string) =>
    [...el.querySelectorAll<HTMLButtonElement>('.auth-nav button')].find(
      (b) => b.textContent!.trim() === label,
    )!;
  const click = async (label: string) => {
    navButton(label).click();
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const choose = (label: string) => {
    [...el.querySelectorAll<HTMLButtonElement>('.segmented button')]
      .find((b) => b.textContent!.trim() === label)!
      .click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    auth = TestBed.inject(Auth);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(Login);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('top-right buttons', () => {
    it('hides the card until Login or Register is clicked', () => {
      expect(el.querySelector('.card')).toBeNull();
      expect(el.querySelector('input')).toBeNull();
      expect(navButton('Login')).toBeTruthy();
      expect(navButton('Register')).toBeTruthy();
    });

    it('shows the email / phone choice when Login is clicked and focuses the field', async () => {
      await click('Login');

      expect(el.querySelector('h1')!.textContent).toContain('Welcome back');
      expect(input('login-identifier').type).toBe('email');
      expect(el.querySelector('#login-otp')).toBeNull();
      expect(el.querySelector('#login-password')).toBeNull();
      expect(navButton('Login').getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(input('login-identifier'));
    });

    it('shows only the register fields when Register is clicked', async () => {
      await click('Register');

      expect(el.querySelector('h1')!.textContent).toContain('Join YamiForge');
      for (const id of ['register-username', 'register-phone', 'register-email']) {
        expect(input(id)).toBeTruthy();
      }
      expect(el.querySelector('#register-password')).toBeNull();
      expect(el.querySelector('#login-identifier')).toBeNull();
    });

    it('swaps forms when the other button is clicked', async () => {
      await click('Login');
      await click('Register');

      expect(el.querySelector('#login-identifier')).toBeNull();
      expect(input('register-username')).toBeTruthy();
    });

    it('hides the card again on a second click, the close button or Escape', async () => {
      await click('Login');
      await click('Login');
      expect(el.querySelector('.card')).toBeNull();

      await click('Login');
      el.querySelector<HTMLButtonElement>('.close')!.click();
      fixture.detectChanges();
      expect(el.querySelector('.card')).toBeNull();

      await click('Register');
      el.querySelector('form')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(el.querySelector('.card')).toBeNull();
    });
  });

  it('has no stats or training-style boxes, just the login card', () => {
    expect(el.querySelector('.disciplines')).toBeNull();
    for (const text of ['24/7', 'Coaches', 'Powerlifting', 'Calisthenics', 'Hypertrophy']) {
      expect(el.textContent).not.toContain(text);
    }
  });

  describe('login form', () => {
    beforeEach(async () => {
      await click('Login');
    });

    it('switches the field between email and phone', () => {
      choose('Phone');
      expect(input('login-identifier').type).toBe('tel');
      expect(el.querySelector('label[for="login-identifier"]')!.textContent).toContain('Phone');

      choose('Email');
      expect(input('login-identifier').type).toBe('email');
    });

    it('shows a required error and does not send a code on an empty submit', async () => {
      const request = vi.spyOn(auth, 'requestOtp');
      await submit();

      expect(request).not.toHaveBeenCalled();
      expect(el.querySelector('#login-identifier-error')?.textContent).toContain('Enter your email');
    });

    it('validates the email and the phone number', async () => {
      type('login-identifier', 'not-an-email');
      await submit();
      expect(el.querySelector('#login-identifier-error')?.textContent).toContain('valid email');

      choose('Phone');
      type('login-identifier', '12345');
      await submit();
      expect(el.querySelector('#login-identifier-error')?.textContent).toContain('10-digit');
    });

    it('opens a popup instead of asking for a code when no account matches', async () => {
      type('login-identifier', 'ghost@yamiforge.com');
      await submit();

      const popup = el.querySelector('[role="alertdialog"]')!;
      expect(popup.textContent).toContain('not a member yet');
      expect(popup.textContent).toContain('ghost@yamiforge.com');
      expect(el.querySelector('#login-otp')).toBeNull();
    });

    it('closes the popup with Try again, keeping the form', async () => {
      choose('Phone');
      type('login-identifier', '9000000099');
      await submit();
      el.querySelectorAll<HTMLButtonElement>('.modal-btn')[1].click();
      fixture.detectChanges();

      expect(el.querySelector('[role="alertdialog"]')).toBeNull();
      expect(input('login-identifier').value).toBe('9000000099');
    });

    it('opens the Register form from the popup', async () => {
      type('login-identifier', 'ghost@yamiforge.com');
      await submit();
      el.querySelector<HTMLButtonElement>('.modal-btn.primary')!.click();
      fixture.detectChanges();

      expect(el.querySelector('[role="alertdialog"]')).toBeNull();
      expect(input('register-username')).toBeTruthy();
    });

    it('never opens the popup for a registered email or phone', async () => {
      type('login-identifier', 'member@yamiforge.com');
      await submit();

      expect(el.querySelector('[role="alertdialog"]')).toBeNull();
      expect(input('login-otp')).toBeTruthy();
    });

    it('asks for the code after sending it, without ever showing the code', async () => {
      type('login-identifier', 'member@yamiforge.com');
      await submit();

      expect(input('login-otp')).toBeTruthy();
      expect(el.querySelector('.lede')!.textContent).toContain('me••••@yamiforge.com');
      expect(el.textContent).not.toContain('1234');
    });

    it('signs in with the right code and goes to the dashboard', async () => {
      choose('Phone');
      type('login-identifier', '9876543210');
      await submit();
      type('login-otp', '1234');
      await submit();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
      expect(auth.member()?.username).toBe('member');
    });

    it('rejects a wrong code, shows an error and clears the field', async () => {
      type('login-identifier', 'member@yamiforge.com');
      await submit();
      type('login-otp', '9999');
      await submit();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(el.querySelector('[role="alert"]')?.textContent).toContain('not right');
      expect(input('login-otp').value).toBe('');
    });

    it('lets the member go back and change the email or phone', async () => {
      type('login-identifier', 'member@yamiforge.com');
      await submit();
      el.querySelector<HTMLButtonElement>('.switch .link')!.click();
      fixture.detectChanges();

      expect(input('login-identifier')).toBeTruthy();
      expect(el.querySelector('#login-otp')).toBeNull();
    });
  });

  describe('register form', () => {
    const fill = (username: string, phone: string, email: string) => {
      type('register-username', username);
      type('register-phone', phone);
      type('register-email', email);
    };

    beforeEach(async () => {
      await click('Register');
    });

    it('shows required errors and does not call the API on an empty submit', async () => {
      const register = vi.spyOn(auth, 'register');
      await submit();

      expect(register).not.toHaveBeenCalled();
      for (const id of ['username', 'phone', 'email']) {
        expect(el.querySelector(`#register-${id}-error`)).toBeTruthy();
      }
    });

    it('validates the phone number and email', async () => {
      const register = vi.spyOn(auth, 'register');
      fill('sam99', '123', 'nope');
      await submit();

      expect(register).not.toHaveBeenCalled();
      expect(el.querySelector('#register-phone-error')?.textContent).toContain('10-digit');
      expect(el.querySelector('#register-email-error')?.textContent).toContain('valid email');
    });

    it('creates the account and opens Login with the email filled in, not the dashboard', async () => {
      fill('sam99', '9000000001', 'sam@example.com');
      await submit();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(auth.isLoggedIn()).toBe(false);
      expect(el.querySelector('h1')!.textContent).toContain('Welcome back');
      expect(el.querySelector('.notice')!.textContent).toContain('Account created');
      expect(input('login-identifier').value).toBe('sam@example.com');
    });

    it('lets the new member then sign in with the code', async () => {
      fill('sam99', '9000000001', 'sam@example.com');
      await submit();
      await submit();
      type('login-otp', '1234');
      await submit();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
      expect(auth.member()?.username).toBe('sam99');
    });

    it('reports a taken username, phone or email', async () => {
      fill('member', '9000000001', 'sam@example.com');
      await submit();
      expect(el.querySelector('[role="alert"]')?.textContent).toContain('username is already taken');

      fill('sam99', '9876543210', 'sam@example.com');
      await submit();
      expect(el.querySelector('[role="alert"]')?.textContent).toContain('phone number');

      fill('sam99', '9000000001', 'member@yamiforge.com');
      await submit();
      expect(el.querySelector('[role="alert"]')?.textContent).toContain('email already exists');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });
});
