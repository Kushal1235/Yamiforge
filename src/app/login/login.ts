import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../auth/auth';
import { HeroScene } from './hero-scene';

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
  private readonly usernameInput = viewChild<ElementRef<HTMLInputElement>>('usernameInput');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** The login fields stay tucked away until the member opens the card. */
  protected readonly open = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly loginError = signal('');

  protected toggle(): void {
    this.open() ? this.close() : this.openCard();
  }

  protected close(): void {
    this.open.set(false);
  }

  private openCard(): void {
    this.open.set(true);
    // The fields are `inert` until the next render, so wait for it before focusing.
    afterNextRender(() => this.usernameInput()?.nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }

  protected showError(field: 'username' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected async submit(): Promise<void> {
    this.loginError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);
    const { username, password } = this.form.getRawValue();
    const member = await this.auth.login(username, password);
    this.submitting.set(false);

    if (member) {
      await this.router.navigateByUrl('/dashboard');
    } else {
      this.loginError.set('Incorrect username or password. Please try again.');
      this.form.controls.password.reset();
    }
  }
}
