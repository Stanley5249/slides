<script lang="ts" module>
  let componentId = 0;
</script>

<script lang="ts">
  import { browser } from "$app/environment";
  import { getPresentation } from "@animotion/core";
  import { tick } from "svelte";
  import Check from "lucide-svelte/icons/check";
  import Copy from "lucide-svelte/icons/copy";
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

  // The counter lives in the module block, so the increment is read by the next
  // instance rather than by anything below it here.
  // eslint-disable-next-line no-useless-assignment
  const instanceId = ++componentId;

  let renderState = $state<RenderState>({ kind: "rendering" });
  let copied = $state(false);
  let copiedTimer: ReturnType<typeof setTimeout>;

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
  <div class={`error ${className}`}>
    <div class="error-head">
      <span>Mermaid error</span>
      <button
        type="button"
        onclick={copyError}
        aria-label={copied ? "Message copied" : "Copy the message"}
        title="Copy the message"
      >
        {#if copied}
          <span class="check"><Check size={18} strokeWidth={2.25} /></span>
        {:else}
          <Copy size={18} strokeWidth={2.25} />
        {/if}
      </button>
    </div>
    <pre class="error-body">{renderState.message}</pre>
  </div>
{:else}
  <div class={`loading ${className}`}>Rendering diagram…</div>
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

  /* Explicit, because the plate suppresses selection while a drag is live. */
  .diagram :global(foreignObject),
  .diagram :global(text) {
    user-select: text;
  }

  .loading {
    display: grid;
    min-height: 8rem;
    place-items: center;
    font-size: 1rem;
  }

  /* Same plate rule as Zoom: the canvas with a hairline, one step above its ground. */
  .error {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    background: var(--deck-canvas);
    border: 1px solid var(--deck-rule);
    border-radius: 0.75rem;
    box-shadow: 0 0.5rem 1.5rem
      color-mix(in srgb, var(--deck-veil) 56%, transparent);
  }

  .error-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0.75rem 0.75rem 1.25rem;
    color: var(--deck-bad);
    font-weight: 600;
    font-size: 1.1rem;
    background: var(--deck-panel);
    border-bottom: 1px solid var(--deck-rule);
  }

  .error-head button {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    padding: 0;
    color: var(--deck-ink);
    background: var(--deck-hover);
    border: 1px solid var(--deck-rule);
    border-radius: 0.5rem;
    cursor: pointer;
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

  /* One shade further from the canvas than the resting fill, in whichever
     direction the flavor runs. */
  .error-head button:hover {
    background: color-mix(in srgb, var(--deck-hover) 88%, var(--deck-ink));
  }

  .error-head button:focus-visible {
    outline: 3px solid var(--deck-focus);
    outline-offset: 3px;
  }

  .error-body {
    max-height: 24rem;
    margin: 0;
    padding: 1.25rem;
    overflow: auto;
    color: var(--deck-ink);
    font-size: 0.95rem;
    font-family: "Monaspace Neon", ui-monospace, monospace;
    line-height: 1.5;
    text-align: left;
    white-space: pre-wrap;
    user-select: text;
    tab-size: 2;
  }
</style>
