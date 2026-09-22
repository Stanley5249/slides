<script lang="ts">
  import { Action, Code } from "@animotion/core";
  import { tween } from "@animotion/motion";
  import { codeTheme } from "$lib/theme";

  let code: ReturnType<typeof Code>;
  const dot = tween({ x: 60 });
</script>

<p class="act">The mechanics</p>

<h2>Code and motion, one step at a time</h2>

<p class="lede">
  Each press advances one step. Nothing on a slide plays by itself, because the
  room is listening to a person.
</p>

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

  <svg viewBox="0 0 560 160" width="100%" height="160" aria-hidden="true">
    <circle cx={dot.x} cy="80" r="52" style:fill="var(--deck-accent)" />
    <text
      x={dot.x}
      y="80"
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

<Action
  actions={[
    async () => {
      await code.update`
        async function move() {
          await dot.to({ x: 500 })
        }
      `;
      await code.selectLines`2`;
      await dot.to({ x: 500 });
    },
    async () => {
      await code.update`
        async function move() {
          await dot.to({ x: 500 })
          await dot.to({ x: 60 })
        }
      `;
      await code.selectLines`3`;
      await dot.to({ x: 60 });
    },
    async () => {
      await code.selectLines`*`;
    },
  ]}
/>
