<script lang="ts">
  import { Presentation, Slides } from "@animotion/core";
</script>

<Presentation
  options={{
    // 16:9. Every layout in this template is a side-by-side, and 4:3 squeezes
    // all of them.
    width: 1280,
    height: 720,
    history: true,
    transition: "slide",
    // Reveal's own arrows, bottom right. The template styles the slide surface
    // only; browsing is Reveal's job.
    controls: true,
    controlsBackArrows: "faded",
    progress: true,
    slideNumber: "c/t",
  }}
  plugins={{ notes: true }}
>
  <Slides />
</Presentation>
