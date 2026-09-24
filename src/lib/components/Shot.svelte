<script lang="ts">
  import ImageOff from "lucide-svelte/icons/image-off";
  import Zoom from "$lib/components/Zoom.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    /** A path under `static/` or a URL. A file dropped into `static/` needs no
     * build step, which is why a real deck keeps its pictures there. */
    src: string;
    alt: string;
    /** Plain text, or a snippet when the caption carries a link. */
    caption?: string | Snippet;
    /** Height of the picture itself. Omit it and the picture fills the width it is given. */
    height?: string;
    class?: string;
  };

  let { src, alt, caption, height, class: className = "" }: Props = $props();

  // A screenshot that has not been supplied yet must say so on the slide, not fail silently.
  let missing = $state(false);
</script>

<figure class={className} class:missing>
  {#if missing}
    <div class="slot placeholder" style:height>
      <ImageOff size={28} strokeWidth={1.75} />
      <p>{alt}</p>
      <code class="path">static{src}</code>
    </div>
  {:else}
    <Zoom label={alt}>
      <img
        {src}
        {alt}
        style:height
        style:width={height ? "auto" : "100%"}
        onerror={() => (missing = true)}
      />
      {#snippet zoomed()}
        <img {src} {alt} class="zoomed" />
      {/snippet}
    </Zoom>
  {/if}
  {#if caption}
    <figcaption>
      {#if typeof caption === "string"}{caption}{:else}{@render caption()}{/if}
    </figcaption>
  {/if}
</figure>

<style>
  /* The frame is the picture. A height and an auto width size the box to what is actually drawn,
     so a capped screenshot leaves no empty box beside itself; overrides.css then centers it. */
  figure {
    width: fit-content;
    max-width: 100%;
  }

  /* A missing picture has no size of its own to fit, so the slot takes the width it is given and
     holds the place a 16:9 capture would. */
  .missing {
    width: 100%;
  }

  img {
    display: block;
    max-width: 100%;
  }

  .zoomed {
    width: auto;
    max-height: 80vh;
  }

  /* The slot from layouts.css, in the shape of the 16:9 capture it stands in for. */
  .placeholder {
    aspect-ratio: 16 / 9;
    place-items: center;
    text-align: center;
  }

  /* The path is words an author has to read, so it keeps the quiet ink and the label size. A mark
     would dim it below the ratio text has to clear. The dashed slot already frames it, so it takes
     no plate. The class outweighs the deck's inline code rule, which Svelte's scoping alone does
     not. */
  .placeholder .path {
    padding: 0;
    background: none;
  }
</style>
