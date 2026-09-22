<script lang="ts">
  import { Transition } from "@animotion/core";

  let items = $state([1, 2, 3, 4]);
</script>

<h2>A list that moves when it changes</h2>

<div class="row">
  <p>
    Reordering inside a view transition animates each element to its new place.
    The template implements none of that, and neither does the slide.
  </p>

  <div class="strip">
    {#each items as item, i (item)}
      <Transition visible entry="rotate" duration={1.2} delay={i * 0.08}>
        <span class="tile">{item}</span>
      </Transition>
    {/each}
  </div>

  <p>
    Motion that answers a keypress is welcome, because it shows what changed.
    Motion that plays by itself is not, because the room is listening to a
    person.
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
    gap: 32px;
  }

  /* A numeral on a hairline, not a card: the movement is the subject, so the
     shape around it stays quiet. */
  .tile {
    display: grid;
    width: 170px;
    height: 120px;
    place-content: center;
    color: var(--deck-ink);
    font-size: 60px;
    font-family: var(--r-code-font), ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
    border-bottom: 2px solid var(--deck-rule-strong);
  }
</style>
