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
    // Everything Reveal already defaults to is left alone: the arrows, the
    // progress rule and the slide transition are its job, and the template only
    // recolors them. The counter is the one piece of chrome it ships off.
    slideNumber: "h.v",
    // A background iframe is otherwise only fetched on the way into its slide,
    // so opening the deck straight at one shows an empty stage. A talk wants
    // the site warm before the presenter arrives either way.
    preloadIframes: true,
  }}
  plugins={{ notes: true }}
>
  <Slides />
</Presentation>
