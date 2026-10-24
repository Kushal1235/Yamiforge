import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WORKOUT_PHOTOS } from '../workout-photos';

/**
 * Full-screen artwork with the same dark tint and warm glow as the sign-in screen. It shows the
 * gym scene by default and switches to the chosen workout's picture when one is given.
 */
@Component({
  selector: 'app-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './backdrop.html',
  styleUrl: './backdrop.scss',
})
export class Backdrop {
  /** Training category id whose picture should fill the screen; none shows the gym scene. */
  readonly workout = input<string | null | undefined>(null);

  /** A workout picture fills the screen and stays still; the gym scene drifts slowly. */
  protected readonly picture = computed(() => {
    const photo = WORKOUT_PHOTOS[this.workout() ?? ''];
    return photo
      ? { ...photo, whole: true }
      : { src: 'images/backgrounds/gym-baki.webp', position: '50% 40%', whole: false };
  });
}
