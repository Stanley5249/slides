<script lang="ts">
  import { Transition } from "@animotion/core";

  let items = $state([1, 2, 3, 4]);
</script>

<h2>Move items to their new order</h2>

<div class="row">
  <div class="strip">
    {#each items as item (item)}
      <Transition visible>
        <span class="tile">{item}</span>
      </Transition>
    {/each}
  </div>

  <p>
    A view transition carries each item from its old place to its new one, so
    the room sees what moved instead of spotting the difference.
  </p>
</div>

<Transition
  transitions={[
    () => (items = [4, 3, 2, 1]),
    () => (items = [2, 1, 4, 3]),
    () => (items = [1, 2, 3, 4]),
  ]}
/>

<style>
  .strip {
    display: flex;
    gap: var(--deck-gap);
  }

  /* A numeral and nothing else: the movement is the subject, so the shape
     around it stays quiet. */
  .tile {
    /* Grid because <Transition> wraps each numeral in a div of its own, which
       leaves the span inline and deaf to a width. Two ems of slot, tabular
       figures inside it, so a reorder moves the glyphs and not the strip. The
       figures start the slot, so the first one keeps the content edge. */
    display: grid;
    place-content: center start;
    min-width: 2em;
    color: var(--deck-ink);
    font-size: var(--deck-text-title);
    font-family: var(--r-code-font), ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
  }
</style>
