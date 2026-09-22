<script lang="ts" module>
  import { defineProps } from "@animotion/core";

  // Reveal draws a background iframe in its own layer behind `.slides`, at the
  // full size of the stage. That is the largest a frame gets, and it costs the
  // template nothing: `iframe` and `interactive` are Animotion's own `<Slide>`
  // props, so nothing here is a component.
  //
  // `interactive` hands pointer and keyboard to the site, which is the point of
  // embedding a live one, but it also means the arrow keys stop reaching the
  // deck until the presenter clicks back onto the slide.
  export const props = defineProps({
    iframe: "https://animotion.pages.dev/",
    interactive: true,
  });
</script>

<script lang="ts">
  import { Notes } from "@animotion/core";
</script>

<Notes>
  A live site, not a screenshot. Click into it to demonstrate, then click the
  slide edge before reaching for the arrow keys.
</Notes>
