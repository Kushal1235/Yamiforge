import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroScene } from './hero-scene';

describe('HeroScene', () => {
  let fixture: ComponentFixture<HeroScene>;
  let el: HTMLElement;

  const root = () => el.querySelector<HTMLElement>('.hs')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HeroScene] }).compileComponents();
    fixture = TestBed.createComponent(HeroScene);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  it('builds the layers at runtime and hides them from assistive tech', () => {
    expect(root()).toBeTruthy();
    expect(root().getAttribute('aria-hidden')).toBe('true');
    for (const cls of ['.hs-layer-bg', '.hs-tint', '.hs-layer-fighter', '.hs-layer-lifter', '.hs-sparks', '.hs-vignette']) {
      expect(el.querySelector(cls)).toBeTruthy();
    }
  });

  it('uses the gym photo as the base with Toji and the standing figure in their own layers', () => {
    expect(el.querySelector('img.hs-baki')!.getAttribute('src')).toBe('images/backgrounds/gym-baki.webp');
    expect(el.querySelector('.hs-layer-fighter img.hs-toji')!.getAttribute('src')).toBe('images/login/hero-toji.jpg');
    expect(el.querySelector('.hs-layer-lifter img.hs-lifter')!.getAttribute('src')).toBe('images/login/hero-standing.jpg');
    // DOM order is paint order: the photo layer must come before both fighter layers.
    const order = Array.from(root().children).map((c) => c.className);
    const at = (cls: string) => order.findIndex((c) => c.includes(cls));
    expect(at('hs-layer-bg')).toBeLessThan(at('hs-layer-fighter'));
    expect(at('hs-layer-bg')).toBeLessThan(at('hs-layer-lifter'));
  });

  it('marks every image decorative (empty alt)', () => {
    for (const img of Array.from(el.querySelectorAll('img'))) {
      expect(img.getAttribute('alt')).toBe('');
    }
  });

  it('creates randomised sparks', () => {
    const sparks = Array.from(el.querySelectorAll<HTMLElement>('.hs-spark'));
    expect(sparks.length).toBe(22);
    const lefts = new Set(sparks.map((s) => s.style.left));
    expect(lefts.size).toBeGreaterThan(10);
  });

  it('turns mouse movement into parallax variables, ignoring touch', () => {
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: window.innerWidth, clientY: 0 }));
    expect(root().style.getPropertyValue('--px')).toBe('1.000');
    expect(root().style.getPropertyValue('--py')).toBe('-1.000');

    const touch = new MouseEvent('pointermove', { clientX: 0, clientY: 0 });
    Object.defineProperty(touch, 'pointerType', { value: 'touch' });
    window.dispatchEvent(touch);
    expect(root().style.getPropertyValue('--px')).toBe('1.000');
  });

  it('removes its DOM and listeners on destroy', () => {
    fixture.destroy();
    expect(el.querySelector('.hs')).toBeNull();
    // A late pointer event must not throw once destroyed.
    expect(() => window.dispatchEvent(new MouseEvent('pointermove'))).not.toThrow();
  });
});
