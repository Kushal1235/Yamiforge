import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WORKOUT_PHOTOS } from '../workout-photos';

/** Per-option colours: [background start, background end, glow]. */
const PALETTES: Readonly<Record<string, readonly [string, string, string]>> = {
  strength: ['#1c1f2b', '#0b0c12', '#5b7cff'],
  bodybuilding: ['#2a1436', '#0d0710', '#d34bff'],
  calisthenics: ['#0f2a2a', '#071010', '#2fe0c2'],
  powerlifting: ['#321414', '#100606', '#ff4b4b'],
  'hiit-crossfit': ['#33160c', '#100603', '#ff7a1a'],
};

/** Illustrated scene for a training style, goal or split, drawn as inline SVG. */
@Component({
  selector: 'app-workout-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workout-art.html',
  styleUrl: './workout-art.scss',
})
export class WorkoutArt {
  readonly kind = input.required<string>();

  protected readonly lines = [40, 120, 200, 280, 360];

  protected readonly photo = computed(() => WORKOUT_PHOTOS[this.kind()]);

  protected palette(): { bg: string; bg2: string; glow: string } {
    const [bg, bg2, glow] = PALETTES[this.kind()] ?? PALETTES['strength'];
    return { bg, bg2, glow };
  }
}
