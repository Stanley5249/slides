<script lang="ts">
  import { browser } from "$app/environment";
  import { getPresentation } from "@animotion/core";
  import { tick } from "svelte";
  import Check from "lucide-svelte/icons/check";
  import Copy from "lucide-svelte/icons/copy";
  import Workflow from "lucide-svelte/icons/workflow";
  import Zoom from "$lib/components/Zoom.svelte";
  import { renderMermaid } from "$lib/mermaid";

  type Props = {
    code: string;
    label?: string;
    class?: string;
  };

  type RenderState =
    | { kind: "rendering" }
    | { kind: "ready"; svg: string; width: string }
    | { kind: "failed"; message: string };

  let {
    code,
    label = "Open Mermaid diagram",
    class: className = "",
  }: Props = $props();

  const instanceId = $props.id();

  let renderState = $state<RenderState>({ kind: "rendering" });
  let copied = $state(false);
  let copiedTimer: ReturnType<typeof setTimeout>;

  // The confirmation outlives the component when a slide moves while it shows.
  $effect(() => () => {
    clearTimeout(copiedTimer);
  });

  $effect(() => {
    if (!browser) return;

    // The flag drops a render whose source changed under it before it finished.
    // It is a field rather than a local because the cleanup below writes it
    // while the work above is suspended at an await.
    const render = { cancelled: false };

    void (async () => {
      try {
        const svg = await renderMermaid(code, `mermaid-${instanceId}`);
        if (render.cancelled) return;
        renderState = { kind: "ready", svg, width: naturalWidth(svg) };
      } catch (error) {
        if (render.cancelled) return;
        renderState = {
          kind: "failed",
          message:
            error instanceof Error
              ? error.message
              : "Could not render this diagram.",
        };
      }
      // A freshly sized diagram changes the slide height, so Reveal has to measure again.
      await tick();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      // TypeScript keeps a property narrowed across a call it cannot see into,
      // so it reads this flag as still false. The cleanup writes it.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!render.cancelled) getPresentation().slides?.layout();
    })();

    return () => {
      render.cancelled = true;
    };
  });

  // Mermaid ships the SVG at width="100%", which has no definite basis in a shrink-to-fit parent and
  // collapses every diagram to the same width. The viewBox carries the real one; max-content is the
  // fallback because it fails visibly wide rather than invisibly narrow.
  function naturalWidth(svg: string) {
    const viewBoxWidth = Number(/viewBox="\S+ \S+ (\S+) /.exec(svg)?.[1]);
    return viewBoxWidth > 0 ? `${viewBoxWidth}px` : "max-content";
  }

  // Mermaid's parser points at a fault with a line of dashes and a caret under
  // a line of source. Those two lines keep their columns and scroll sideways
  // together; every other line wraps to the slot.
  function messageLines(message: string) {
    const lines = message.split("\n");
    const caret = (line: string | undefined) => /^-*\^\s*$/.test(line ?? "");
    return lines.map((text, i) => ({
      text,
      exact: caret(text) || caret(lines[i + 1]),
    }));
  }

  async function copyError() {
    if (renderState.kind !== "failed") return;
    await navigator.clipboard.writeText(renderState.message);
    copied = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied = false), 1500);
  }
</script>

{#if renderState.kind === "ready"}
  {@const { svg, width } = renderState}
  {#snippet plate(source: string, capped: boolean)}
    <!-- The markup is an SVG Mermaid rendered under its strict security level,
         from a diagram source the deck itself holds. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <span class="diagram" class:capped style:width>{@html source}</span>
  {/snippet}
  <Zoom {label} class={className}>
    {@render plate(svg, true)}
    {#snippet zoomed()}
      <!-- Its own ID namespace: two copies of one string would define the same marker IDs, and
           every url(#id) in both would resolve to whichever came first. -->
      {@render plate(
        svg.replaceAll(`mermaid-${instanceId}`, `mermaid-${instanceId}-zoom`),
        false,
      )}
    {/snippet}
  </Zoom>
{:else if renderState.kind === "failed"}
  <div class={`slot failed ${className}`}>
    <div class="head">
      <Workflow size={20} strokeWidth={2} />
      <p>Mermaid could not render this diagram</p>
      <button
        type="button"
        class="copy"
        onclick={copyError}
        aria-label={copied ? "Message copied" : "Copy the message"}
        title="Copy the message"
      >
        {#if copied}
          <span class="check"><Check size={20} strokeWidth={2} /></span>
        {:else}
          <Copy size={20} strokeWidth={2} />
        {/if}
      </button>
    </div>
    <!-- Focusable so the arrow keys scroll the message rather than the deck, and exempt from
         Reveal's swipe so scrolling it on a touch screen stays on the slide. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
    <pre
      class="message"
      tabindex="0"
      aria-label="Mermaid error message"
      data-prevent-swipe
      onkeydown={(event) =>
        event.stopPropagation()}>{#each messageLines(renderState.message) as line, i (i)}<span
          class="line"
          class:exact={line.exact}>{line.text}</span
        >{/each}</pre>
  </div>
{:else}
  <div class={`slot ${className}`}><p>Rendering diagram…</p></div>
{/if}

<style>
  .diagram {
    display: block;
    margin: auto;
    line-height: 0;
  }

  /* The preview fits its box; the zoomed copy lays out at the natural size the camera scales. */
  .capped {
    max-width: 100%;
    max-height: 24rem;
  }

  .diagram :global(svg) {
    display: block;
    width: 100%;
    height: auto;
    /* Inherited, so the cap reaches the SVG in a preview and is none in the Zoom plate. */
    max-height: inherit;
  }

  /* A diagram that is not drawn holds its place the way a missing screenshot
     does: a dashed slot in quiet ink, so it reads as unfinished work rather
     than as content. */
  .slot {
    display: grid;
    width: 100%;
    min-height: var(--deck-slot-min);
    gap: 0.5rem;
    place-content: center;
    padding: 1rem;
    color: var(--deck-ink-quiet);
    font-size: var(--deck-text-label);
    border: 1px dashed var(--deck-rule-strong);
  }

  /* A failure is words to read, so the slot fits them rather than a picture's
     shape: one line names the failure, and the message takes the full width
     under it. */
  .failed {
    place-content: start stretch;
    padding-top: 0.5rem;
  }

  /* The error role marks the one line that says something failed. The
     message under it stays in quiet ink, so the slot stays one family with a
     missing screenshot. */
  .head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--deck-bad);
  }

  .head p {
    min-width: 0;
  }

  /* The message scrolls past a few lines rather than growing the slot, and
     sideways only when the source line under the caret outruns the width.
     A tab is one column to Mermaid when it places the caret, so it is one
     column here. Scoped under the slot so it outranks the deck's own
     `.reveal .slides pre`, which would otherwise set the line height. */
  .failed .message {
    max-height: 7.5lh;
    margin: 0;
    overflow: auto;
    overscroll-behavior: contain;
    font-family: var(--r-code-font), ui-monospace, monospace;
    line-height: 1.4;
    tab-size: 1;
    user-select: text;
    scrollbar-width: thin;
    scrollbar-color: var(--deck-rule-strong) transparent;
  }

  .message:focus-visible {
    outline: var(--deck-focus-ring) solid var(--deck-focus);
    outline-offset: 2px;
  }

  .line {
    display: block;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .line.exact {
    width: max-content;
    white-space: pre;
  }

  .copy {
    display: grid;
    margin-left: auto;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    padding: 0;
    color: var(--deck-ink-quiet);
    background: none;
    border: 0;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .copy:hover {
    color: var(--deck-ink);
    background: var(--deck-hover);
  }

  .copy:focus-visible {
    outline: var(--deck-focus-ring) solid var(--deck-focus);
    outline-offset: 2px;
  }

  .check {
    display: grid;
    color: var(--deck-ok);
    animation: pop 120ms ease-out;
  }

  @keyframes pop {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .check {
      animation: none;
    }
  }
</style>
