// The pan and zoom camera behind the zoomed view: a scale, a translation, and
// the input that moves them. It owns the whole gesture, so the component is
// left with the elements it binds and the dialog it opens.

type Drag = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

// An offset from the center of the viewport, the point a zoom holds still.
type Origin = {
  x: number;
  y: number;
};

// Low enough that a tall subject can actually be fitted whole.
const minScale = 0.1;
const maxScale = 4;
// Ceiling for the automatic fit only, so a small subject opens comfortably instead of enormous.
const maxFitScale = 2;
const scaleStep = 0.25;
const panStep = 48;
// A pinch is a wheel event with ctrlKey and a delta far smaller than a notch.
const wheelZoomRate = 0.0015;
const pinchZoomRate = 0.01;

// The keys move the content, matching a drag, not the viewport as a scrollbar would.
export const panKeys: Record<string, [number, number] | undefined> = {
  ArrowLeft: [-panStep, 0],
  ArrowRight: [panStep, 0],
  ArrowUp: [0, -panStep],
  ArrowDown: [0, panStep],
};

export class Camera {
  scale = $state(1);
  x = $state(0);
  y = $state(0);
  // A discrete change animates; a wheel or a drag has to track the input exactly.
  smooth = $state(false);

  #drag = $state<Drag | null>(null);

  transform = $derived(
    `translate3d(${this.x}px, ${this.y}px, 0) scale(${this.scale})`,
  );
  percent = $derived(Math.round(this.scale * 100));
  atMin = $derived(this.scale <= minScale);
  atMax = $derived(this.scale >= maxScale);
  dragging = $derived(this.#drag !== null);

  reset() {
    this.scale = 1;
    this.x = 0;
    this.y = 0;
    this.smooth = false;
    this.#drag = null;
  }

  // The default view: whichever edge runs out first decides the scale, capped by maxFitScale.
  fit(viewport: HTMLElement, canvas: HTMLElement, plate: HTMLElement) {
    const padding = getComputedStyle(canvas);
    const availableWidth =
      viewport.clientWidth -
      parseFloat(padding.paddingLeft) -
      parseFloat(padding.paddingRight);
    const availableHeight =
      viewport.clientHeight -
      parseFloat(padding.paddingTop) -
      parseFloat(padding.paddingBottom);
    // offsetWidth/Height are layout sizes, unaffected by the camera transform, so this measures
    // the same whatever the camera is doing and the fit can be a single write.
    const fit = Math.min(
      availableWidth / plate.offsetWidth,
      availableHeight / plate.offsetHeight,
    );
    this.scale = Math.min(maxFitScale, Math.max(minScale, fit));
    this.x = 0;
    this.y = 0;
  }

  // Continuous, and anchored on the pointer: a wheel or a pinch.
  zoomWheel(event: WheelEvent, viewport: HTMLElement) {
    const rate = event.ctrlKey ? pinchZoomRate : wheelZoomRate;
    const bounds = viewport.getBoundingClientRect();
    this.smooth = false;
    this.#scaleTo(this.scale * Math.exp(-event.deltaY * rate), {
      x: event.clientX - (bounds.left + bounds.width / 2),
      y: event.clientY - (bounds.top + bounds.height / 2),
    });
  }

  // Notches of the toolbar or the keyboard, centered rather than anchored.
  step(notches: number) {
    this.smooth = true;
    this.#scaleTo(this.scale + notches * scaleStep);
  }

  pan(dx: number, dy: number) {
    this.smooth = true;
    this.x += dx;
    this.y += dy;
  }

  // The capture belongs to the gesture, so the camera takes it and the pointer
  // can leave the viewport mid-drag without the plate sticking.
  startDrag(event: PointerEvent, viewport: HTMLElement) {
    if (event.button !== 0 || this.#drag) return;
    // A drag preventDefaults clicks and selections away.
    event.preventDefault();
    event.stopPropagation();
    this.smooth = false;
    this.#drag = {
      pointerId: event.pointerId,
      offsetX: event.clientX - this.x,
      offsetY: event.clientY - this.y,
    };
    viewport.setPointerCapture(event.pointerId);
  }

  moveDrag(event: PointerEvent) {
    const drag = this.#drag;
    if (drag?.pointerId !== event.pointerId) return;

    this.x = event.clientX - drag.offsetX;
    this.y = event.clientY - drag.offsetY;
  }

  stopDrag(event: PointerEvent) {
    if (this.#drag?.pointerId === event.pointerId) this.#drag = null;
  }

  // Holding a point still means moving the translation by the ratio the scale moved.
  #scaleTo(next: number, origin?: Origin) {
    const previous = this.scale;
    const bounded = Math.min(maxScale, Math.max(minScale, next));
    if (bounded === previous) return;

    if (origin) {
      const ratio = bounded / previous;
      this.x = origin.x - (origin.x - this.x) * ratio;
      this.y = origin.y - (origin.y - this.y) * ratio;
    }

    this.scale = bounded;
  }
}
