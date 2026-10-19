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
  const submit = async () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
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

  beforeEach(async () => {
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
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('top-right buttons', () => {
    it('hides the centre card until Login or Register is clicked', () => {
      expect(el.querySelector('.card')).toBeNull();
      expect(el.querySelector('input')).toBeNull();
      expect(navButton('Login')).toBeTruthy();
      expect(navButton('Register')).toBeTruthy();
    });

    it('shows only the login fields when Login is clicked and focuses the username', async () => {
      await click('Login');

      expect(el.querySelector('h1')!.textContent).toContain('Welcome back');
      expect(input('login-username')).toBeTruthy();
      expect(input('login-password')).toBeTruthy();
      expect(el.querySelector('#register-name')).toBeNull();
      expect(navButton('Login').getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(input('login-username'));
    });

    it('shows only the register fields when Register is clicked', async () => {
      await click('Register');

      expect(el.querySelector('h1')!.textContent).toContain('Join YamiForge');
      for (const id of ['register-name', 'register-username', 'register-password', 'register-confirm']) {
        expect(input(id)).toBeTruthy();
      }
      expect(el.querySelector('#login-username')).toBeNull();
    });

    it('swaps forms when the other button is clicked', async () => {
      await click('Login');
      await click('Register');

      expect(el.querySelector('#login-username')).toBeNull();
      expect(input('register-name')).toBeTruthy();
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

    it('renders labelled username and password fields', () => {
      expect(el.querySelector('label[for="login-username"]')).toBeTruthy();
      expect(el.querySelector('label[for="login-password"]')).toBeTruthy();
      expect(input('login-password').type).toBe('password');
    });

    it('shows required errors and does not call the API on an empty submit', async () => {
      const login = vi.spyOn(auth, 'login');
      await submit();

      expect(login).not.toHaveBeenCalled();
      expect(el.querySelector('#login-username-error')?.textContent).toContain('Enter your username');
      expect(el.querySelector('#login-password-error')?.textContent).toContain('Enter your password');
    });

    it('shows length errors for a too-short username and password', async () => {
      type('login-username', 'ab');
      type('login-password', '123');
      await submit();

      expect(el.querySelector('#login-username-error')?.textContent).toContain('at least 3');
      expect(el.querySelector('#login-password-error')?.textContent).toContain('at least 6');
    });

    it('toggles password visibility', () => {
      const toggle = el.querySelector<HTMLButtonElement>('.toggle')!;
      toggle.click();
      fixture.detectChanges();
      expect(input('login-password').type).toBe('text');
      expect(toggle.getAttribute('aria-pressed')).toBe('true');

      toggle.click();
      fixture.detectChanges();
      expect(input('login-password').type).toBe('password');
    });

    it('signs in with valid credentials and goes to the dashboard', async () => {
      vi.spyOn(auth, 'login').mockResolvedValue({ username: 'member', name: 'Alex' });
      type('login-username', 'member');
      type('login-password', 'forge123');
      await submit();

      expect(auth.login).toHaveBeenCalledWith('member', 'forge123');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('shows an error and clears the password when credentials are wrong', async () => {
      vi.spyOn(auth, 'login').mockResolvedValue(null);
      type('login-username', 'member');
      type('login-password', 'wrongpass');
      await submit();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(el.querySelector('[role="alert"]')?.textContent).toContain('Incorrect username');
      expect(input('login-password').value).toBe('');
    });

    it('disables the button while signing in to prevent double submits', async () => {
      let finish!: (v: null) => void;
      vi.spyOn(auth, 'login').mockReturnValue(new Promise((resolve) => (finish = resolve)));
      type('login-username', 'member');
      type('login-password', 'forge123');

      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
      expect(el.querySelector<HTMLButtonElement>('.submit')!.disabled).toBe(true);

      finish(null);
      await fixture.whenStable();
      fixture.detectChanges();
      expect(el.querySelector<HTMLButtonElement>('.submit')!.disabled).toBe(false);
    });
  });

  describe('register form', () => {
    const fill = (name: string, username: string, password: string, confirm: string) => {
      type('register-name', name);
      type('register-username', username);
      type('register-password', password);
      type('register-confirm', confirm);
    };

    beforeEach(async () => {
      await click('Register');
    });

    it('shows required errors and does not call the API on an empty submit', async () => {
      const register = vi.spyOn(auth, 'register');
      await submit();

      expect(register).not.toHaveBeenCalled();
      for (const id of ['name', 'username', 'password', 'confirm']) {
        expect(el.querySelector(`#register-${id}-error`)).toBeTruthy();
      }
    });

    it('rejects mismatched passwords', async () => {
      const register = vi.spyOn(auth, 'register');
      fill('Sam', 'sam99', 'forge123', 'forge124');
      await submit();

      expect(register).not.toHaveBeenCalled();
      expect(el.querySelector('#register-confirm-error')?.textContent).toContain('do not match');
    });

    it('creates the account and goes to the dashboard', async () => {
      fill('Sam', 'sam99', 'forge123', 'forge123');
      await submit();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
      expect(auth.member()).toEqual({ username: 'sam99', name: 'Sam' });
    });

    it('reports a taken username', async () => {
      fill('Alex', 'member', 'forge123', 'forge123');
      await submit();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(el.querySelector('[role="alert"]')?.textContent).toContain('already taken');
    });
  });
});
