<script lang="ts">
  import { flushSync } from "svelte";
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

  // The view transition snapshots the page before and after its callback, so
  // the new order has to reach the DOM inside it rather than on Svelte's next
  // flush.
  function show(step: number) {
    const reorder = () => flushSync(() => (items = steps[step]));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) reorder();
    else document.startViewTransition(reorder);
  }

  // Opening the slide again sets the first order without a transition, which
  // would otherwise run under the deck's own fade.
  function reset() {
    items = steps[0];
  }
</script>

<h2>Move items to their new order</h2>

<div class="row" {@attach restart(reset)}>
  <div class="strip">
    {#each items as item (item)}
      <span class="tile" style:view-transition-name="tile-{item}">{item}</span>
    {/each}
  </div>

  <p>
    A view transition carries each item from its old place to its new one, so
    the room sees what moved instead of spotting the difference.
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
     around it stays quiet. Two ems of slot, tabular figures inside it, so a
     reorder moves the glyphs and not the strip. The figures start the slot,
     so the first one keeps the content edge. */
  .tile {
    display: grid;
    place-content: center start;
    min-width: 2em;
    color: var(--deck-ink);
    font-size: var(--deck-text-title);
    font-family: var(--r-code-font), ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
  }
</style>
