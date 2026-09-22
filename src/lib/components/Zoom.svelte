<script lang="ts">
  import type { Snippet } from "svelte";
  import { tick } from "svelte";
  import Minus from "lucide-svelte/icons/minus";
  import Plus from "lucide-svelte/icons/plus";
  import RotateCcw from "lucide-svelte/icons/rotate-ccw";
  import X from "lucide-svelte/icons/x";
  import { dismissable } from "$lib/dismissable";

  type Props = {
    label?: string;
    class?: string;
    children: Snippet;
    zoomed?: Snippet;
  };

  type DragState = {
    pointerId: number;
    offsetX: number;
    offsetY: number;
  };

  let {
    label = "Open zoomed view",
    class: className = "",
    children,
    zoomed,
  }: Props = $props();

  const full = $derived(zoomed ?? children);

  // Low enough that a tall subject can actually be fitted whole.
  const minScale = 0.1;
  const maxScale = 4;
  // Ceiling for the automatic fit only, so a small subject opens comfortably instead of enormous.
  const maxFitScale = 2;
  const scaleStep = 0.25;
  const panStep = 48;
  // A drag preventDefaults clicks and selections away. Mirrored by the cursor rules in the style.
  const exempt = "button, a, input, textarea, text, tspan, foreignObject";
  // A pinch is a wheel event with ctrlKey and a delta far smaller than a notch.
  const wheelZoomRate = 0.0015;
  const pinchZoomRate = 0.01;

  let dialog: HTMLDialogElement | undefined;
  // Conditionally rendered, so these bindings are reassigned and need signals.
  let viewport = $state<HTMLDivElement>();
  let canvas = $state<HTMLDivElement>();
  let plate = $state<HTMLElement>();
  let open = $state(false);
  let camera = $state(createCamera());
  let drag = $state<DragState | null>(null);
  let smooth = $state(false);

  function createCamera() {
    return { scale: 1, x: 0, y: 0 };
  }

  // The default view: whichever edge runs out first decides the scale, capped by maxFitScale.
  async function resetView() {
    // The plate is mounted with the dialog, so it may not be bound yet on the first open.
    await tick();
    if (!viewport || !canvas || !plate) return;

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
    // the same whatever the camera is doing and the reset can be a single write.
    const fit = Math.min(
      availableWidth / plate.offsetWidth,
      availableHeight / plate.offsetHeight,
    );
    camera = {
      scale: Math.min(maxFitScale, Math.max(minScale, fit)),
      x: 0,
      y: 0,
    };
  }

  async function show() {
    if (!dialog) return;
    open = true;
    dialog.showModal();
    await tick();
    smooth = false;
    await resetView();
  }

  function handleDialogClose() {
    open = false;
    camera = createCamera();
    drag = null;
  }

  function setScale(nextScale: number, clientX?: number, clientY?: number) {
    const previousScale = camera.scale;
    const boundedScale = Math.min(maxScale, Math.max(minScale, nextScale));
    if (boundedScale === previousScale) return;

    if (clientX !== undefined && clientY !== undefined && viewport) {
      const bounds = viewport.getBoundingClientRect();
      const pointerX = clientX - (bounds.left + bounds.width / 2);
      const pointerY = clientY - (bounds.top + bounds.height / 2);
      const ratio = boundedScale / previousScale;
      camera.x = pointerX - (pointerX - camera.x) * ratio;
      camera.y = pointerY - (pointerY - camera.y) * ratio;
    }

    camera.scale = boundedScale;
  }

  function stepScale(delta: number) {
    smooth = true;
    setScale(camera.scale + delta);
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();
    smooth = false;
    const factor = Math.exp(
      -event.deltaY * (event.ctrlKey ? pinchZoomRate : wheelZoomRate),
    );
    setScale(camera.scale * factor, event.clientX, event.clientY);
  }

  // The keys move the content, matching a drag, not the viewport as a scrollbar would.
  const panKeys: Record<string, [number, number] | undefined> = {
    ArrowLeft: [-panStep, 0],
    ArrowRight: [panStep, 0],
    ArrowUp: [0, -panStep],
    ArrowDown: [0, panStep],
  };

  function handleKeydown(event: KeyboardEvent) {
    // Reveal listens on document, so the deck must not navigate while the viewer is open.
    event.stopPropagation();

    const pan = panKeys[event.key];
    if (
      event.ctrlKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault();
      stepScale(event.key === "ArrowUp" ? scaleStep : -scaleStep);
    } else if (pan) {
      event.preventDefault();
      smooth = true;
      camera.x += pan[0];
      camera.y += pan[1];
    } else if (event.key === "+" || event.key === "=") {
      stepScale(scaleStep);
    } else if (event.key === "-") {
      stepScale(-scaleStep);
    } else if (event.key === "0") {
      smooth = true;
      void resetView();
    }
  }

  function startDrag(event: PointerEvent) {
    if (event.button !== 0 || drag || !viewport) return;
    if (event.target instanceof Element && event.target.closest(exempt)) return;
    smooth = false;
    event.preventDefault();
    event.stopPropagation();
    drag = {
      pointerId: event.pointerId,
      offsetX: event.clientX - camera.x,
      offsetY: event.clientY - camera.y,
    };
    viewport.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent) {
    if (drag?.pointerId !== event.pointerId) return;

    camera.x = event.clientX - drag.offsetX;
    camera.y = event.clientY - drag.offsetY;
  }

  function stopDrag(event: PointerEvent) {
    if (drag?.pointerId !== event.pointerId) return;
    drag = null;
  }
</script>

<!-- The trigger is layered over the preview instead of wrapping it, so the preview can hold its own
     interactive markup without nesting buttons. -->
<div class={`preview ${className}`}>
  {@render children()}
  <button type="button" class="hit" onclick={show} aria-label={label}></button>
</div>

<dialog
  bind:this={dialog}
  class="viewer"
  onclose={handleDialogClose}
  onkeydown={(event) => event.stopPropagation()}
  {@attach dismissable(".viewport, .canvas")}
>
  <!-- Deliberate: the viewport is a real keyboard-operable pan/zoom surface, not decorative. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={viewport}
    class:dragging={drag !== null}
    class="viewport"
    role="application"
    tabindex="0"
    aria-label="Zoomed view. Arrow keys pan, control with up or down zooms, plus and minus zoom, zero resets."
    onwheel={handleWheel}
    onkeydown={handleKeydown}
    onpointerdown={startDrag}
    onpointermove={moveDrag}
    onpointerup={stopDrag}
    onlostpointercapture={stopDrag}
  >
    <div
      bind:this={canvas}
      class="canvas"
      class:smooth
      style:transform={`translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`}
    >
      <!-- Mounted on open only, so a preview nobody opens costs nothing. -->
      {#if open}
        <div bind:this={plate} class="plate">{@render full()}</div>
      {/if}
    </div>
  </div>

  <button
    type="button"
    class="close"
    onclick={() => dialog?.close()}
    aria-label="Close zoomed view"
    title="Close"
  >
    <X size={22} strokeWidth={2.25} />
  </button>

  <div class="zoom-controls" role="group" aria-label="Zoom controls">
    <button
      type="button"
      onclick={() => stepScale(-scaleStep)}
      disabled={camera.scale <= minScale}
      aria-label="Zoom out"
      title="Zoom out"
    >
      <Minus size={21} strokeWidth={2.25} />
    </button>
    <button
      type="button"
      class="percentage"
      onclick={() => {
        smooth = true;
        void resetView();
      }}
      aria-label="Reset zoom"
      title="Reset zoom"
    >
      <RotateCcw size={16} strokeWidth={2.25} />
      {Math.round(camera.scale * 100)}%
    </button>
    <button
      type="button"
      onclick={() => stepScale(scaleStep)}
      disabled={camera.scale >= maxScale}
      aria-label="Zoom in"
      title="Zoom in"
    >
      <Plus size={21} strokeWidth={2.25} />
    </button>
  </div>
</dialog>

<style>
  /* Plate rule: every zoom surface is the canvas with a hairline, one step above its ground. */
  .preview {
    position: relative;
    /* Column flex, not grid: a grid item's automatic minimum size is its min-content width, so
       wide content blows the column out instead of honouring its own max-width. */
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    min-height: 8rem;
    padding: 1rem;
    overflow: hidden;
    color: var(--deck-ink);
    background: var(--deck-canvas);
    border: 1px solid var(--deck-rule);
    border-radius: 0.75rem;
    box-shadow: 0 0.5rem 1.5rem
      color-mix(in srgb, var(--deck-veil) 56%, transparent);
  }

  .preview:hover {
    border-color: var(--deck-accent);
  }

  .hit {
    position: absolute;
    inset: 0;
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: inherit;
    cursor: zoom-in;
  }

  .hit:focus-visible,
  .close:focus-visible,
  .zoom-controls button:focus-visible {
    outline: 3px solid var(--deck-focus);
    outline-offset: 3px;
  }

  .viewport:focus-visible {
    outline: 3px solid var(--deck-focus);
    outline-offset: -3px;
  }

  .viewer {
    --canvas-side: 3rem;
    --toolbar-inset: clamp(1.5rem, 8vh, 10rem);
    /* Toolbar height plus breathing room, so the canvas never runs under the controls. */
    --toolbar-space: calc(var(--toolbar-inset) + 4rem);

    position: fixed;
    inset: 0;
    width: 100dvw;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    color: var(--deck-ink);
    background: transparent;
    border: 0;
    transform: none;
  }

  .viewer::backdrop {
    background: color-mix(in srgb, var(--deck-veil) 78%, transparent);
    backdrop-filter: blur(5px);
  }

  .viewport {
    position: absolute;
    inset: 0;
    overflow: hidden;
    cursor: grab;
    touch-action: none;
  }

  /* Only while dragging: otherwise text in the plate could not be selected or copied. */
  .viewport.dragging {
    cursor: grabbing;
    user-select: none;
  }

  /* Mirrors the exempt list in startDrag, so the grab cursor never promises a pan that will not
     happen. Controls carry their own cursor; text gets the caret that says it can be selected. */
  .viewport :global(:is(button, a, input, textarea)) {
    cursor: auto;
  }

  .viewport :global(:is(text, tspan, foreignObject)) {
    cursor: text;
  }

  .canvas {
    position: absolute;
    inset: 0;
    padding: var(--toolbar-space) var(--canvas-side);
    transform-origin: center;
  }

  /* Held permanently, the layer keeps one raster and the camera stretches that bitmap, blurring an
     SVG that would redraw sharp at any scale. */
  .viewport.dragging .canvas {
    will-change: transform;
  }

  .canvas.smooth {
    transition: transform 120ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .canvas.smooth {
      transition: none;
    }
  }

  /* Centred with a transform: grid and flex start-align an item larger than their area, which drops
     a tall subject off the bottom once the camera scales it. */
  .plate {
    position: absolute;
    top: 50%;
    left: 50%;
    line-height: 0;
    background: var(--deck-canvas);
    border: 1px solid var(--deck-rule);
    border-radius: 0.75rem;
    box-shadow: 0 1.25rem 3.5rem
      color-mix(in srgb, var(--deck-veil) 78%, transparent);
    transform: translate(-50%, -50%);
  }

  .close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 2;
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    padding: 0;
    color: var(--deck-ink);
    background: transparent;
    border: 0;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .close:hover {
    background: color-mix(in srgb, var(--deck-hover) 80%, transparent);
  }

  .zoom-controls {
    position: absolute;
    bottom: var(--toolbar-inset);
    left: 50%;
    z-index: 2;
    display: flex;
    align-items: stretch;
    background: color-mix(in srgb, var(--deck-panel) 92%, transparent);
    border: 1px solid var(--deck-rule);
    border-radius: 0.6rem;
    box-shadow: 0 0.5rem 1.5rem
      color-mix(in srgb, var(--deck-veil) 62%, transparent);
    transform: translateX(-50%);
    backdrop-filter: blur(12px);
  }

  .zoom-controls button {
    display: grid;
    min-width: 2.5rem;
    place-items: center;
    padding: 0.45rem 0.7rem;
    color: var(--deck-ink);
    font: inherit;
    font-size: 1rem;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  /* No overflow clipping on the bar: it would cut the focus ring off. */
  .zoom-controls button:first-child {
    border-radius: 0.5rem 0 0 0.5rem;
  }

  .zoom-controls button:last-child {
    border-radius: 0 0.5rem 0.5rem 0;
  }

  .zoom-controls button:hover:not(:disabled) {
    background: var(--deck-hover);
  }

  .zoom-controls button:disabled {
    color: var(--deck-mark);
    cursor: default;
  }

  .zoom-controls .percentage {
    grid-auto-flow: column;
    gap: 0.4rem;
    min-width: 5.5rem;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 640px) {
    .viewer {
      --canvas-side: 1rem;
    }
  }
</style>
