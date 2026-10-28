<script lang="ts">
  import { browser } from "$app/env";
  import { getPresentation } from "@animotion/core";
  import { tick } from "svelte";
  import Check from "lucide-svelte/icons/check";
  import Copy from "lucide-svelte/icons/copy";
  import Workflow from "lucide-svelte/icons/workflow";
  import Zoom from "#lib/components/Zoom.svelte";
  import { renderMermaid } from "#lib/mermaid.ts";

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
        const { svg, width } = await renderMermaid(
          code,
          `mermaid-${instanceId}`,
        );
        if (render.cancelled) return;
        renderState = { kind: "ready", svg, width: `${width}px` };
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

  // The parser points at a fault with a line of dashes and a caret under
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
    <!-- The markup is an SVG Pele rendered with its text escaped, from a
         diagram source the deck itself holds. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <span class="diagram" class:capped style:width>{@html source}</span>
  {/snippet}
  <Zoom {label} class={className}>
    {@render plate(svg, true)}
    {#snippet zoomed()}
      <!-- Its own ID namespace: two copies of one string would define the same title and
           description IDs, and the zoomed copy would be labelled by the preview's. -->
      {@render plate(
        svg.replaceAll(`mermaid-${instanceId}`, `mermaid-${instanceId}-zoom`),
        false,
      )}
    {/snippet}
  </Zoom>
{:else if renderState.kind === "failed"}
  <div class={`deck-slot failed ${className}`}>
    <div class="head">
      <Workflow size={20} strokeWidth={2} />
      <p>Could not render this diagram</p>
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
      aria-label="Diagram error message"
      data-prevent-swipe
      onkeydown={(event) =>
        event.stopPropagation()}>{#each messageLines(renderState.message) as line, i (i)}<span
          class="line"
          class:exact={line.exact}>{line.text}</span
        >{/each}</pre>
  </div>
{:else}
  <div class={`deck-slot ${className}`}><p>Rendering diagram…</p></div>
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

  /* Pele reads its colors from these properties at paint time, so a diagram
     is drawn in the deck's own roles and reads as part of the slide rather
     than as a picture pasted onto it. */
  .diagram {
    --pele-bg: var(--deck-canvas);
    --pele-fg: var(--deck-ink);
    --pele-muted: var(--deck-ink-quiet);
    --pele-line: var(--deck-mark);
    --pele-surface: var(--deck-panel);
    --pele-surface-alt: var(--deck-canvas);
    --pele-border: var(--deck-rule-strong);
    --pele-accent: var(--deck-focus);
    --pele-error: var(--deck-bad);
  }

  /* Pele draws edges and borders at 1px, which a projector loses. */
  .diagram :global(.pele-edge path:not(.pele-marker)) {
    stroke-width: 2px;
  }

  .diagram :global(.pele-node :is(rect, polygon, circle, path)) {
    stroke-width: 1.5px;
  }

  .diagram :global(svg) {
    display: block;
    width: 100%;
    height: auto;
    /* Inherited, so the cap reaches the SVG in a preview and is none in the Zoom plate. */
    max-height: inherit;
  }

  /* A diagram that is not drawn holds its place in the slot from layouts.css,
     the way a missing screenshot does. */
  .deck-slot {
    width: 100%;
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
     A tab is one column to the parser when it places the caret, so it is one
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
