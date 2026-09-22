<script lang="ts">
  import { Transition } from "@animotion/core";

  let items = $state([1, 2, 3, 4]);
</script>

<h2>Motion belongs to the presenter’s next point</h2>

<div class="row">
  <p>
    When the list changes, a view transition carries each item to its new
    position. The movement makes the new order easy to follow.
  </p>

  <div class="strip">
    {#each items as item, i (item)}
      <Transition visible entry="rotate" duration={1.2} delay={i * 0.08}>
        <span class="tile">{item}</span>
      </Transition>
    {/each}
  </div>

  <p>
    Each step begins with a keypress. The presenter controls the pace, and the
    animation only explains what changed.
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
  /* Named globally because Animotion writes `animation: rotate` into a
     `::view-transition-new` rule of its own, where a scoped name would not
     resolve. It lives here because this slide is the only thing that asks for
     it: an entry animation is a deck's choice, not the template's. */
  @keyframes -global-rotate {
    from {
      opacity: 0;
    }

    40% {
      opacity: 1;
    }

    to {
      rotate: 360deg;
    }
  }

  .strip {
    display: flex;
    gap: var(--deck-gap);
  }

  /* A numeral and nothing else: the movement is the subject, so the shape
     around it stays quiet. */
  .tile {
    /* Grid because <Transition> wraps each numeral in a div of its own, which
       leaves the span inline and deaf to a width. Two ems of slot, tabular
       figures inside it, so a reorder moves the glyphs and not the strip. */
    display: grid;
    place-content: center;
    min-width: 2em;
    color: var(--deck-ink);
    font-size: var(--deck-text-title);
    font-family: var(--r-code-font), ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
  }
</style>
