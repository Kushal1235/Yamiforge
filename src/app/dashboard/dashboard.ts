import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from '../auth/auth';
import { Backdrop } from '../shared/ui/backdrop/backdrop';
import { TrainingSetupStore } from '../training/training-setup';

/** Signed-in frame: header on top, and the member's own workout plan page below. */
@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, Backdrop],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  private readonly store = inject(TrainingSetupStore);

  protected readonly member = this.auth.member;
  /** The member's workout, whose picture becomes the page background. */
  protected readonly workout = computed(() => this.store.setup()?.categoryId);

  protected async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
