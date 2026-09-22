<script lang="ts" module>
  // `<Slides />` spreads this onto the section it wraps a file-based slide in,
  // which is how such a slide reaches Animotion's own `in` event. The first
  // step answers the keypress that arrived here, so the slide is never a still
  // picture waiting for a second press.
  let arrive: (() => void) | undefined;
  export const props = { in: () => arrive?.() };
</script>

<script lang="ts">
  import { Action, Code } from "@animotion/core";
  import { tween } from "@animotion/motion";
  import { codeTheme } from "$lib/theme";

  let code: ReturnType<typeof Code>;
  const dot = tween({ x: 60 });

  async function there() {
    await code.update`
      async function move() {
        await dot.to({ x: 500 })
      }
    `;
    await code.selectLines`2`;
    await dot.to({ x: 500 });
  }

  async function back() {
    await code.update`
      async function move() {
        await dot.to({ x: 500 })
        await dot.to({ x: 60 })
      }
    `;
    await code.selectLines`3`;
    await dot.to({ x: 60 });
  }

  arrive = () => void there();
</script>

<h2>Code and motion, one step at a time</h2>

<div class="cols even">
  <Code
    bind:this={code}
    lang="ts"
    theme={codeTheme}
    code={`async function move() {
  // ...
}`}
    options={{ duration: 600, stagger: 0.3, containerStyle: false }}
  />

  <svg viewBox="0 0 560 200" width="100%" height="200" aria-hidden="true">
    <circle cx={dot.x} cy="100" r="56" style:fill="var(--deck-accent)" />
    <text
      x={dot.x}
      y="100"
      font-size="24"
      font-family="Monaspace Neon"
      text-anchor="middle"
      dominant-baseline="middle"
      style:fill="var(--deck-canvas)"
    >
      {dot.x.toFixed(0)}
    </text>
  </svg>
</div>

<!-- One step, and the way back out of it: Reveal fires `out` when the deck
     steps backward, so the slide restores what arriving set up. -->
<Action do={back} undo={there} />
