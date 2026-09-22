<script lang="ts">
  import type { Snippet } from "svelte";
  import { tick } from "svelte";
  import Minus from "lucide-svelte/icons/minus";
  import Plus from "lucide-svelte/icons/plus";
  import RotateCcw from "lucide-svelte/icons/rotate-ccw";
  import X from "lucide-svelte/icons/x";
  import { Camera, panKeys } from "$lib/camera.svelte";
  import { dismissable } from "$lib/dismissable";

  type Props = {
    label?: string;
    class?: string;
    children: Snippet;
    zoomed?: Snippet;
  };

  let {
    label = "Open zoomed view",
    class: className = "",
    children,
    zoomed,
  }: Props = $props();

  const full = $derived(zoomed ?? children);

  const camera = new Camera();

  let dialog: HTMLDialogElement | undefined;
  // Conditionally rendered, so these bindings are reassigned and need signals.
  let viewport = $state<HTMLDivElement>();
  let canvas = $state<HTMLDivElement>();
  let plate = $state<HTMLElement>();
  let open = $state(false);

  async function fitView() {
    // The plate is mounted with the dialog, so it may not be bound yet on the first open.
    await tick();
    if (viewport && canvas && plate) camera.fit(viewport, canvas, plate);
  }

  async function show() {
    if (!dialog) return;
    open = true;
    dialog.showModal();
    camera.smooth = false;
    await fitView();
  }

  function resetView() {
    camera.smooth = true;
    void fitView();
  }

  function handleDialogClose() {
    open = false;
    camera.reset();
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (viewport) camera.zoomWheel(event, viewport);
  }

  function handleKeydown(event: KeyboardEvent) {
    // Reveal listens on document, so the deck must not navigate while the viewer is open.
    event.stopPropagation();

    const pan = panKeys[event.key];
    if (
      event.ctrlKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault();
      camera.step(event.key === "ArrowUp" ? 1 : -1);
    } else if (pan) {
      event.preventDefault();
      camera.pan(pan[0], pan[1]);
    } else if (event.key === "+" || event.key === "=") {
      camera.step(1);
    } else if (event.key === "-") {
      camera.step(-1);
    } else if (event.key === "0") {
      resetView();
    }
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
    class:dragging={camera.dragging}
    class="viewport"
    role="application"
    tabindex="0"
    aria-label="Zoomed view. Arrow keys pan, control with up or down zooms, plus and minus zoom, zero resets."
    onwheel={handleWheel}
    onkeydown={handleKeydown}
    onpointerdown={(event) => viewport && camera.startDrag(event, viewport)}
    onpointermove={(event) => camera.moveDrag(event)}
    onpointerup={(event) => camera.stopDrag(event)}
    onlostpointercapture={(event) => camera.stopDrag(event)}
  >
    <div
      bind:this={canvas}
      class="canvas"
      class:smooth={camera.smooth}
      style:transform={camera.transform}
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
      onclick={() => camera.step(-1)}
      disabled={camera.atMin}
      aria-label="Zoom out"
      title="Zoom out"
    >
      <Minus size={21} strokeWidth={2.25} />
    </button>
    <button
      type="button"
      class="percentage"
      onclick={resetView}
      aria-label="Reset zoom"
      title="Reset zoom"
    >
      <RotateCcw size={16} strokeWidth={2.25} />
      {camera.percent}%
    </button>
    <button
      type="button"
      onclick={() => camera.step(1)}
      disabled={camera.atMax}
      aria-label="Zoom in"
      title="Zoom in"
    >
      <Plus size={21} strokeWidth={2.25} />
    </button>
  </div>
</dialog>

<style>
  /* No plate. A diagram or a screenshot on a slide is evidence, and a frame
     around it makes it read as a widget. The viewer it opens keeps its plate,
     because that one really is apparatus. */
  .preview {
    position: relative;
    /* Column flex, not grid: a grid item's automatic minimum size is its min-content width, so
       wide content blows the column out instead of honoring its own max-width. */
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    min-height: 8rem;
    overflow: hidden;
    color: var(--deck-ink);
  }

  /* The only affordance, so the surface still says it opens. */
  .preview:hover {
    background: color-mix(in srgb, var(--deck-ink) 6%, transparent);
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
    user-select: none;
  }

  .viewport.dragging {
    cursor: grabbing;
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

  /* Centered with a transform: grid and flex start-align an item larger than their area, which drops
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
