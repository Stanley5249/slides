<script lang="ts" module>
  import { defineProps } from "@animotion/core";

  // The preview pane is taller than the listing at every step, so the block
  // keeps one height and can sit centered without moving as lines arrive.
  export const props = defineProps({ class: "middle" });
</script>

<script lang="ts">
  import { Action, Code } from "@animotion/core";
  import { tween } from "@animotion/motion";
  import { codeTheme } from "$lib/theme";

  let code: ReturnType<typeof Code>;
  let dot = tween({ x: 0 });

  // Every step sets the whole state it shows, so stepping back replays the
  // previous step and lands on the same picture.
  async function there() {
    await code.update`
      async function animate() {
        await dot.to({ x: 400 })
      }
    `;
    await code.selectLines`2`;
    await dot.to({ x: 400 });
  }

  async function back() {
    await code.update`
      async function animate() {
        await dot.to({ x: 400 })
        await dot.to({ x: 0 })
      }
    `;
    await code.selectLines`3`;
    await dot.to({ x: 0 });
  }

  async function review() {
    await code.update`
      async function animate() {
        await dot.to({ x: 400 })
        await dot.to({ x: 0 })
      }
    `;
    await code.selectLines`*`;
    await dot.to({ x: 0 });
  }

  async function reset() {
    await code.update`
      async function animate() {
      }
    `;
    await code.selectLines`*`;
    dot.reset();
  }

  // A slide keeps its state after the deck moves on, so coming back forward
  // would show the last step with none of its fragments. Start over whenever
  // the slide opens before any step is taken. Coming back from the next slide
  // opens it on the last step, which replays `review`.
  function restart(listing: HTMLElement) {
    const slide = listing.closest("section");
    if (!slide) return;

    const open = () => {
      if (!slide.querySelector(".fragment.visible")) void reset();
    };
    slide.addEventListener("in", open);
    return () => slide.removeEventListener("in", open);
  }
</script>

<h2>Step through code</h2>

<div class="cols even">
  <div {@attach restart}>
    <Code
      bind:this={code}
      lang="ts"
      theme={codeTheme}
      code={"async function animate() {\n}"}
      options={{ duration: 600, stagger: 0.3, containerStyle: false }}
    />
  </div>

  <div class="preview">
    <svg viewBox="-40 -40 480 80" aria-hidden="true">
      <line x1="0" x2="400" />
      <circle cx={dot.x} r="32" />
    </svg>
    <p><code>x = {Math.round(dot.x)}</code></p>
  </div>
</div>

<Action undo={reset} actions={[there, back, review]} />

<style>
  /* What the code draws, in a pane of its own beside it. The pane is an
     output, not evidence, so it takes the panel surface the viewers and error
     reports use. The readout ties the highlighted line to the value it sets. */
  .preview {
    display: grid;
    gap: var(--deck-gap-tight);
    width: 100%;
    padding: var(--deck-gap);
    background: var(--deck-panel);
    border: 1px solid var(--deck-rule);
    border-radius: 0.75rem;
  }

  svg {
    width: 100%;
  }

  line {
    stroke: var(--deck-rule-strong);
    stroke-width: 2;
  }

  circle {
    fill: var(--deck-heading);
  }

  p {
    font-variant-numeric: tabular-nums;
  }
</style>
