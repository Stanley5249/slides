<script lang="ts">
  import { browser } from "$app/environment";
  import { flip } from "svelte/animate";
  import { Action } from "@animotion/core";
  import { restart } from "$lib/restart";

  // Each step is the whole order it shows, so any step can be shown from any
  // other, in either direction.
  const steps = [
    [1, 2, 3, 4],
    [4, 3, 2, 1],
    [2, 1, 4, 3],
    [1, 2, 3, 4],
  ];

  let items = $state(steps[0]);

  // FLIP measures each tile where it is drawn right now, so a step taken
  // mid-move turns the tiles in flight rather than snapping them to the end.
  const duration =
    browser && matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600;

  function show(step: number) {
    items = steps[step];
  }
</script>

<h2>Move items to their new order</h2>

<div class="row" {@attach restart(() => show(0))}>
  <div class="strip">
    {#each items as item (item)}
      <span class="tile" animate:flip={{ duration }}>{item}</span>
    {/each}
  </div>

  <p>
    Each item slides from its old place to its new one, so the room sees what
    moved instead of spotting the difference.
  </p>
</div>

<Action
  undo={() => show(0)}
  actions={[() => show(1), () => show(2), () => show(3)]}
/>

<style>
  .strip {
    display: flex;
    gap: var(--deck-gap);
  }

  /* A numeral and nothing else: the movement is the subject, so the shape
     around it stays quiet. Two ems of slot, monospace figures inside it, so a
     reorder moves the glyphs and not the strip. The figures start the slot,
     so the first one keeps the content edge. */
  .tile {
    display: grid;
    place-content: center start;
    min-width: 2em;
    font-size: var(--deck-text-title);
    font-family: var(--r-code-font), ui-monospace, monospace;
  }
</style>
