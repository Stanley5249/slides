<script lang="ts">
  import { Code } from "@animotion/core";
  import type { ComponentProps } from "svelte";
  import { codeTheme } from "$lib/theme";

  let {
    lang,
    code,
  }: {
    lang: ComponentProps<typeof Code>["lang"];
    code: string;
  } = $props();

  function containNavigation(event: KeyboardEvent) {
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        " ",
      ].includes(event.key)
    ) {
      event.stopPropagation();
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (Scrollable code needs keyboard focus; arrows scroll here instead of navigating Reveal.) -->
<div
  class="code-block"
  role="region"
  aria-label={`${lang} code example`}
  tabindex="0"
  onkeydown={containNavigation}
>
  <Code {lang} {code} theme={codeTheme} autoIndent={false} />
</div>

<style>
  /* Wrap long source lines instead of rewriting the source or shrinking the
     type, which the room cannot read. A block taller than the stage scrolls,
     and stays keyboard-scrollable, rather than splitting across slides. */
  .code-block {
    min-width: 0;
    max-height: 432px;
    overflow: auto;
  }
  .code-block :global(pre) {
    width: 100%;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .code-block :global(.shiki-magic-move-item) {
    display: inline;
    white-space: pre-wrap;
  }
</style>
