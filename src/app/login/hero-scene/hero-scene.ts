import {
  Component,
  DestroyRef,
  ElementRef,
  Renderer2,
  RendererStyleFlags2,
  ViewEncapsulation,
  afterNextRender,
  inject,
} from '@angular/core';

const SPARK_COUNT = 22;
// Fraction of the viewport the pointer must travel for a layer to reach its full parallax offset.
const PARALLAX_RANGE = 0.5;

/**
 * Full-screen backdrop for the login page. The layers (gym photo, Toji, standing figure, tint, sparks) are
 * created at runtime with Renderer2 and stacked back to front. Replace the files in
 * public/images/ to change the artwork.
 */
@Component({
  selector: 'app-hero-scene',
  template: '',
  styleUrl: './hero-scene.scss',
  // Nodes are created imperatively, so the styles are global but namespaced with `hs-`.
  encapsulation: ViewEncapsulation.None,
})
export class HeroScene {
  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    const destroyRef = inject(DestroyRef);

    // Browser only, so SSR/prerender never touches window or random numbers.
    afterNextRender(() => destroyRef.onDestroy(this.build(host, renderer)));
  }

  private build(host: HTMLElement, renderer: Renderer2): () => void {
    const make = (tag: string, attrs: Record<string, string> = {}, parent?: Element): HTMLElement => {
      const el: HTMLElement = renderer.createElement(tag);
      for (const [name, value] of Object.entries(attrs)) {
        renderer.setAttribute(el, name, value);
      }
      if (parent) {
        renderer.appendChild(parent, el);
      }
      return el;
    };

    const root = make('div', { class: 'hs', 'aria-hidden': 'true' });

    // Back to front: gym photo -> warm tint -> Toji (right) -> standing figure (left) -> sparks -> vignette.
    const bg = make('div', { class: 'hs-layer hs-layer-bg' }, root);
    make('img', { class: 'hs-baki', src: 'images/backgrounds/gym-baki.webp', alt: '', draggable: 'false', fetchpriority: 'high' }, bg);
    make('div', { class: 'hs-tint' }, root);

    const fighter = make('div', { class: 'hs-layer hs-layer-fighter' }, root);
    make('img', { class: 'hs-toji', src: 'images/login/hero-toji.jpg', alt: '', draggable: 'false' }, fighter);

    const lifter = make('div', { class: 'hs-layer hs-layer-lifter' }, root);
    make('img', { class: 'hs-lifter', src: 'images/login/hero-standing.jpg', alt: '', draggable: 'false' }, lifter);

    const sparks = make('div', { class: 'hs-sparks' }, root);
    for (let i = 0; i < SPARK_COUNT; i++) {
      const size = 2 + Math.random() * 3;
      const spark = make('span', { class: 'hs-spark' }, sparks);
      renderer.setStyle(spark, 'left', `${Math.random() * 100}%`);
      renderer.setStyle(spark, 'width', `${size}px`);
      renderer.setStyle(spark, 'height', `${size}px`);
      renderer.setStyle(spark, 'animation-duration', `${7 + Math.random() * 9}s`, RendererStyleFlags2.DashCase);
      renderer.setStyle(spark, 'animation-delay', `${-Math.random() * 14}s`, RendererStyleFlags2.DashCase);
    }

    make('div', { class: 'hs-vignette' }, root);
    renderer.appendChild(host, root);

    // Gentle parallax: the pointer position becomes two CSS variables the layers read.
    const setOffset = (x: number, y: number): void => {
      renderer.setStyle(root, '--px', Math.max(-1, Math.min(1, x)).toFixed(3), RendererStyleFlags2.DashCase);
      renderer.setStyle(root, '--py', Math.max(-1, Math.min(1, y)).toFixed(3), RendererStyleFlags2.DashCase);
    };
    const follow = (clientX: number, clientY: number): void =>
      setOffset(
        (clientX / window.innerWidth - 0.5) / PARALLAX_RANGE,
        (clientY / window.innerHeight - 0.5) / PARALLAX_RANGE,
      );

    // Mouse on desktop; a finger touching or dragging on touch screens. (Phone tilt is left out:
    // sensors report constantly and would fight the finger.)
    const unlistenPointer = renderer.listen('window', 'pointermove', (e: PointerEvent) => {
      if (!e.pointerType || e.pointerType === 'mouse') {
        follow(e.clientX, e.clientY);
      }
    });
    const onTouch = (e: TouchEvent): void => {
      const touch = e.touches[0];
      if (touch) {
        follow(touch.clientX, touch.clientY);
      }
    };
    const unlistenTouch = renderer.listen('window', 'touchmove', onTouch);
    const unlistenTouchStart = renderer.listen('window', 'touchstart', onTouch);

    return () => {
      unlistenPointer();
      unlistenTouch();
      unlistenTouchStart();
      renderer.removeChild(host, root);
    };
  }
}
