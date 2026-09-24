<script lang="ts" module>
  import { defineProps } from "@animotion/core";

  // The preview pane is taller than the listing at every step, so the block
  // keeps one height and can sit centered without moving as lines arrive.
  export const props = defineProps({ class: "middle" });
</script>

<script lang="ts">
  import { Spring } from "svelte/motion";
  import { Action, Code } from "@animotion/core";
  import { restart } from "$lib/restart";
  import { codeTheme } from "$lib/theme";

  let code: ReturnType<typeof Code>;
  // A spring keeps its speed when the target moves, so a step taken while the
  // dot is still travelling turns it in flight instead of stopping it first.
  const dot = new Spring(0, { stiffness: 0.1, damping: 0.85 });

  // Each step is the whole picture it shows, so any step can be shown from
  // any other, in either direction.
  const steps = [
    {
      source: `
        async function animate() {
        }
      `,
      lines: "*",
      x: 0,
    },
    {
      source: `
        async function animate() {
          await dot.to({ x: 400 })
        }
      `,
      lines: "2",
      x: 400,
    },
    {
      source: `
        async function animate() {
          await dot.to({ x: 400 })
          await dot.to({ x: 0 })
        }
      `,
      lines: "3",
      x: 0,
    },
  ];

  // The listing and the dot start together, so the line and what it does
  // arrive as one. The listing selects only once its new line exists.
  function show(step: number) {
    const { source, lines, x } = steps[step];
    return Promise.all([
      code.update`${source}`.then(() => code.selectLines`${lines}`),
      dot.set(x),
    ]);
  }

  // Opening the slide again puts the dot home at once rather than replaying
  // the way back.
  function reset() {
    void dot.set(0, { instant: true });
    return show(0);
  }
</script>

<h2>Step through code</h2>

<div class="cols even">
  <div {@attach restart(reset)}>
    <Code
      bind:this={code}
      lang="ts"
      theme={codeTheme}
      code={steps[0].source}
      options={{
        duration: 600,
        stagger: 0.3,
        containerStyle: false,
        // Lines that make room move at once, and the new line follows close
        // behind instead of waiting out most of the move.
        delayMove: 0,
        delayEnter: 0.2,
      }}
    />
  </div>

  <div class="preview">
    <svg viewBox="-40 -40 480 80" aria-hidden="true">
      <line x1="0" x2="400" />
      <circle cx={dot.current} r="32" />
    </svg>
    <p><code>x = {Math.round(dot.current)}</code></p>
  </div>
</div>

<Action undo={() => show(0)} actions={[() => show(1), () => show(2)]} />

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
