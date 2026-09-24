<script lang="ts">
  import { Presentation, Slides } from "@animotion/core";
  import { prefersReducedMotion } from "svelte/motion";
</script>

<Presentation
  options={{
    // 16:9. Every layout in this template is a side-by-side, and 4:3 squeezes
    // all of them.
    width: 1280,
    height: 720,
    history: true,
    // The arrows and the progress rule are Reveal's, and the template only
    // recolors them. The counter is the one piece of chrome it ships off.
    slideNumber: "h.v",
    // A slide change is the presenter's own action and explains nothing, so it
    // cuts through a short fade rather than sliding the stage sideways. Reveal
    // does not read the reduced-motion preference itself. The server has no
    // media to ask, which does not matter, because Reveal only starts in the
    // browser.
    transition: prefersReducedMotion.current ? "none" : "fade",
    transitionSpeed: "fast",
    // A background iframe is otherwise only fetched on the way into its slide,
    // so opening the deck straight at one shows an empty stage. A talk wants
    // the site warm before the presenter arrives either way.
    preloadIframes: true,
  }}
  plugins={{ notes: true }}
>
  <Slides />
</Presentation>
