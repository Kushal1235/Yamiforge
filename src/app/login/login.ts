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
import { Auth } from '../auth/auth';
import { HeroScene } from './hero-scene';

type Mode = 'login' | 'register';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null =>
  group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };

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

  protected readonly loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly registerForm = this.fb.group(
    {
      name: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  /** `null` keeps the card hidden; the top-right buttons pick which form it shows. */
  protected readonly mode = signal<Mode | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly formError = signal('');

  protected select(mode: Mode): void {
    if (this.mode() === mode) {
      this.close();
      return;
    }
    this.formError.set('');
    this.showPassword.set(false);
    this.mode.set(mode);
    // The card is created on the next render, so wait for it before focusing.
    afterNextRender(
      () =>
        this.host.nativeElement
          .querySelector<HTMLInputElement>('.card input')
          ?.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }

  protected close(): void {
    this.mode.set(null);
  }

  protected showLoginError(field: 'username' | 'password'): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected showRegisterError(field: 'name' | 'username' | 'password' | 'confirm'): boolean {
    const control = this.registerForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  /** The mismatch error lives on the group, so it only shows once confirm has been touched. */
  protected showMismatch(): boolean {
    const confirm = this.registerForm.controls.confirm;
    return (
      this.registerForm.hasError('mismatch') &&
      !confirm.hasError('required') &&
      (confirm.touched || confirm.dirty)
    );
  }

  protected async submitLogin(): Promise<void> {
    this.formError.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);
    const { username, password } = this.loginForm.getRawValue();
    const member = await this.auth.login(username, password);
    this.submitting.set(false);

    if (member) {
      await this.router.navigateByUrl('/dashboard');
    } else {
      this.formError.set('Incorrect username or password. Please try again.');
      this.loginForm.controls.password.reset();
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
    const { name, username, password } = this.registerForm.getRawValue();
    const result = await this.auth.register(name, username, password);
    this.submitting.set(false);

    if (result.ok) {
      await this.router.navigateByUrl('/dashboard');
    } else {
      this.formError.set('That username is already taken. Try another one.');
    }
  }
}
