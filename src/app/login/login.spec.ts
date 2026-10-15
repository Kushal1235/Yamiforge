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

  describe('dropdown', () => {
    const toggle = () => el.querySelector<HTMLButtonElement>('.reveal')!;
    const fields = () => el.querySelector<HTMLElement>('#login-fields')!;

    it('starts closed with the fields inert so they cannot be tabbed to', () => {
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
      expect(fields().hasAttribute('inert')).toBe(true);
      expect(el.querySelector('.card')!.classList.contains('open')).toBe(false);
    });

    it('opens when the member clicks it and focuses the username', async () => {
      toggle().click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(toggle().getAttribute('aria-expanded')).toBe('true');
      expect(fields().hasAttribute('inert')).toBe(false);
      expect(el.querySelector('.card')!.classList.contains('open')).toBe(true);
      expect(document.activeElement).toBe(input('username'));
    });

    it('closes again on a second click or the Escape key', () => {
      toggle().click();
      fixture.detectChanges();
      toggle().click();
      fixture.detectChanges();
      expect(toggle().getAttribute('aria-expanded')).toBe('false');

      toggle().click();
      fixture.detectChanges();
      el.querySelector('form')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(fields().hasAttribute('inert')).toBe(true);
    });
  });

  it('has no stats or training-style boxes, just the login card', () => {
    expect(el.querySelector('.disciplines')).toBeNull();
    for (const text of ['24/7', 'Coaches', 'Powerlifting', 'Calisthenics', 'Hypertrophy']) {
      expect(el.textContent).not.toContain(text);
    }
  });

  it('renders labelled username and password fields', () => {
    expect(el.querySelector('label[for="username"]')).toBeTruthy();
    expect(el.querySelector('label[for="password"]')).toBeTruthy();
    expect(input('password').type).toBe('password');
  });

  it('shows required errors and does not call the API on an empty submit', async () => {
    const login = vi.spyOn(auth, 'login');
    await submit();

    expect(login).not.toHaveBeenCalled();
    expect(el.querySelector('#username-error')?.textContent).toContain('Enter your username');
    expect(el.querySelector('#password-error')?.textContent).toContain('Enter your password');
  });

  it('shows length errors for a too-short username and password', async () => {
    type('username', 'ab');
    type('password', '123');
    await submit();

    expect(el.querySelector('#username-error')?.textContent).toContain('at least 3');
    expect(el.querySelector('#password-error')?.textContent).toContain('at least 6');
  });

  it('toggles password visibility', () => {
    const toggle = el.querySelector<HTMLButtonElement>('.toggle')!;
    toggle.click();
    fixture.detectChanges();
    expect(input('password').type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    toggle.click();
    fixture.detectChanges();
    expect(input('password').type).toBe('password');
  });

  it('signs in with valid credentials and goes to the dashboard', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue({ username: 'member', name: 'Alex' });
    type('username', 'member');
    type('password', 'forge123');
    await submit();

    expect(auth.login).toHaveBeenCalledWith('member', 'forge123');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error and clears the password when credentials are wrong', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue(null);
    type('username', 'member');
    type('password', 'wrongpass');
    await submit();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Incorrect username');
    expect(input('password').value).toBe('');
  });

  it('disables the button while signing in to prevent double submits', async () => {
    let finish!: (v: null) => void;
    vi.spyOn(auth, 'login').mockReturnValue(new Promise((resolve) => (finish = resolve)));
    type('username', 'member');
    type('password', 'forge123');

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('.submit')!.disabled).toBe(true);

    finish(null);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('.submit')!.disabled).toBe(false);
  });
});
