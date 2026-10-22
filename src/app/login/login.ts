import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, OtpMethod, normalizePhone } from '../auth/auth';
import { HeroScene } from './hero-scene';

type Mode = 'login' | 'register';
type Step = 'identify' | 'otp';

const PHONE_LENGTH = 10;

const phoneValidator = (control: AbstractControl): ValidationErrors | null =>
  normalizePhone(control.value ?? '').length === PHONE_LENGTH ? null : { phone: true };

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, HeroScene],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fb = inject(FormBuilder).nonNullable;

  /** How the member wants to sign in: the code goes to their email or their phone. */
  protected readonly method = signal<OtpMethod>('email');
  protected readonly step = signal<Step>('identify');

  protected readonly loginForm = this.fb.group({
    identifier: [
      '',
      [
        Validators.required,
        (c: AbstractControl): ValidationErrors | null =>
          this.method() === 'email' ? Validators.email(c) : phoneValidator(c),
      ],
    ],
    otp: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  protected readonly registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, phoneValidator]],
    email: ['', [Validators.required, Validators.email]],
  });

  /** `null` keeps the card hidden; the top-right buttons pick which form it shows. */
  protected readonly mode = signal<Mode | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal('');
  /** Good news shown above the login form, e.g. after registering. */
  protected readonly notice = signal('');
  /** The email or phone that has no account, while the "not registered" popup is open. */
  protected readonly notRegistered = signal('');

  protected select(mode: Mode): void {
    if (this.mode() === mode) {
      this.close();
      return;
    }
    this.resetLogin();
    this.formError.set('');
    this.notice.set('');
    this.mode.set(mode);
    this.focusFirstInput();
  }

  protected close(): void {
    this.notice.set('');
    this.mode.set(null);
  }

  protected setMethod(method: OtpMethod): void {
    if (this.method() === method) {
      return;
    }
    this.method.set(method);
    this.resetLogin();
    this.formError.set('');
    this.focusFirstInput();
  }

  /** Goes back from the code step to the email/phone step. */
  protected changeIdentifier(): void {
    this.step.set('identify');
    this.loginForm.controls.otp.reset();
    this.formError.set('');
    this.focusFirstInput();
  }

  protected showLoginError(field: 'identifier' | 'otp'): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected showRegisterError(field: 'username' | 'phone' | 'email'): boolean {
    const control = this.registerForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  /** Where the code was sent, with the middle hidden: "me••••@mail.com" or "••••••3210". */
  protected maskedIdentifier(): string {
    const value = this.loginForm.controls.identifier.value.trim();
    if (this.method() === 'phone') {
      return `••••••${normalizePhone(value).slice(-4)}`;
    }
    const [name, domain] = value.split('@');
    return `${name.slice(0, 2)}••••@${domain}`;
  }

  /** Step 1: checks the account exists and "sends" the code. */
  protected async sendOtp(): Promise<void> {
    this.formError.set('');
    const identifier = this.loginForm.controls.identifier;
    if (identifier.invalid) {
      identifier.markAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);
    const result = await this.auth.requestOtp(this.method(), identifier.value);
    this.submitting.set(false);

    if (result.ok) {
      this.step.set('otp');
      this.focusFirstInput();
    } else {
      this.notRegistered.set(identifier.value.trim());
      this.focusModal();
    }
  }

  protected dismissNotRegistered(): void {
    this.notRegistered.set('');
    this.focusFirstInput();
  }

  /** Closes the popup and opens the Register form instead. */
  protected registerInstead(): void {
    this.notRegistered.set('');
    this.mode.set(null);
    this.select('register');
  }

  /** Step 2: checks the code and signs in. */
  protected async submitLogin(): Promise<void> {
    if (this.step() === 'identify') {
      await this.sendOtp();
      return;
    }
    this.formError.set('');
    const { identifier, otp } = this.loginForm.controls;
    if (otp.invalid) {
      otp.markAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);
    const member = await this.auth.verifyOtp(this.method(), identifier.value, otp.value);
    this.submitting.set(false);

    if (member) {
      await this.router.navigateByUrl('/dashboard');
    } else {
      this.formError.set('That code is not right. Please try again.');
      otp.reset();
    }
  }

  protected async submitRegister(): Promise<void> {
    this.formError.set('');
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);
    const { username, phone, email } = this.registerForm.getRawValue();
    const result = await this.auth.register(username, phone, email);
    this.submitting.set(false);

    if (result.ok) {
      this.showLoginAfterRegister(email.trim());
      return;
    }
    this.formError.set(
      {
        'username-taken': 'That username is already taken. Try another one.',
        'phone-taken': 'An account with that phone number already exists.',
        'email-taken': 'An account with that email already exists.',
      }[result.error],
    );
  }

  /** Registering does not sign anyone in: it opens Login with their email filled in. */
  private showLoginAfterRegister(email: string): void {
    this.registerForm.reset();
    this.method.set('email');
    this.resetLogin();
    this.loginForm.controls.identifier.setValue(email);
    this.mode.set('login');
    this.notice.set('Account created! Sign in with the code we send you.');
    this.focusFirstInput();
  }

  private focusModal(): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLButtonElement>('.modal-btn')?.focus(),
      { injector: this.injector },
    );
  }

  private resetLogin(): void {
    this.step.set('identify');
    this.loginForm.reset();
  }

  /** The card is created on the next render, so wait for it before focusing. */
  private focusFirstInput(): void {
    afterNextRender(
      () =>
        this.host.nativeElement
          .querySelector<HTMLInputElement>('.card input:not([type="radio"])')
          ?.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }
}
