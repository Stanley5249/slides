<script lang="ts">
  import katex from "katex";
  import "katex/dist/katex.min.css";

  type Props = {
    /** TeX source, without the surrounding dollar signs. */
    tex: string;
    /** Set the formula on a line of its own, at display size. */
    display?: boolean;
  };

  let { tex, display = false }: Props = $props();

  // Rendered to markup on the server as well, so a prerendered deck carries its
  // math and KaTeX's fonts come from the bundle rather than a CDN a venue's
  // network may block. A parse error is drawn in place, in the error role, so a
  // broken formula cannot pass as a missing one.
  const html = $derived(
    katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      errorColor: "var(--deck-bad)",
    }),
  );
</script>

<!-- The markup is KaTeX's own rendering of TeX source the deck itself holds. -->
<svelte:element this={display ? "div" : "span"}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
</svelte:element>

<style>
  /* KaTeX's 1.21em evens Computer Modern with a serif's x-height. Atkinson's
     capitals already run tall, so 1.1em keeps an inline W level with the words
     around it. */
  :global(.reveal .slides .katex) {
    font-size: 1.1em;
  }

  /* A formula on its own line is the subject of the slide, so it takes the
     heading tier. It starts on the content edge like every other block rather
     than centering itself the way a paper does. */
  div :global(.katex-display) {
    margin: 0;
    font-size: calc(var(--deck-text-heading) / var(--deck-text-content) * 1em);
    text-align: left;
  }

  div :global(.katex-display > .katex) {
    text-align: left;
  }
</style>
