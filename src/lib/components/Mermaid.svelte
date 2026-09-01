<script lang="ts" module>
	let componentId = 0;
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { getPresentation } from '@animotion/core';
	import { tick } from 'svelte';
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import Zoom from '$lib/components/Zoom.svelte';
	import { renderMermaid } from '$lib/mermaid';

	type Props = {
		code: string;
		label?: string;
		class?: string;
	};

	type RenderState =
		| { kind: 'rendering' }
		| { kind: 'ready'; svg: string; width: string }
		| { kind: 'failed'; message: string };

	let { code, label = 'Open Mermaid diagram', class: className = '' }: Props = $props();

	const instanceId = ++componentId;

	let renderState = $state<RenderState>({ kind: 'rendering' });
	let copied = $state(false);
	let copiedTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (!browser) return;

		// Re-runs if the source or the Mermaid theme changes; the flag drops a render that lost.
		let cancelled = false;

		void (async () => {
			try {
				const svg = await renderMermaid(code, `mermaid-${instanceId}`);
				if (cancelled) return;
				renderState = { kind: 'ready', svg, width: naturalWidth(svg) };
			} catch (error) {
				if (cancelled) return;
				renderState = {
					kind: 'failed',
					message: error instanceof Error ? error.message : 'Could not render this diagram.'
				};
			}
			// A freshly sized diagram changes the slide height, so Reveal has to measure again.
			await tick();
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			if (!cancelled) getPresentation().slides?.layout();
		})();

		return () => {
			cancelled = true;
		};
	});

	// Mermaid ships the SVG with width="100%", which has no definite basis inside a shrink-to-fit
	// parent and collapses every diagram to the same arbitrary width. The viewBox carries the real
	// size, so the wrapper is pinned to it and the SVG fills the wrapper. If the viewBox ever stops
	// matching, max-content keeps a definite basis and fails visibly wide instead of collapsing again.
	function naturalWidth(svg: string) {
		const viewBoxWidth = Number(svg.match(/viewBox="\S+ \S+ (\S+) /)?.[1]);
		return viewBoxWidth > 0 ? `${viewBoxWidth}px` : 'max-content';
	}

	async function copyError() {
		if (renderState.kind !== 'failed') return;
		await navigator.clipboard.writeText(renderState.message);
		copied = true;
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => (copied = false), 1500);
	}
</script>

{#if renderState.kind === 'ready'}
	{@const { svg, width } = renderState}
	{#snippet plate(source: string)}
		<span class="diagram" style:width>{@html source}</span>
	{/snippet}
	<Zoom {label} class={className}>
		{@render plate(svg)}
		{#snippet zoomed()}
			<!-- One render, two copies, so the second gets its own ID namespace. Mermaid prefixes every
			     internal ID with the diagram ID, references included, so one replace covers the markers
			     and the scoped style block. Snippet bodies only run when rendered, so an unopened
			     preview pays nothing for this. -->
			{@render plate(svg.replaceAll(`mermaid-${instanceId}`, `mermaid-${instanceId}-zoom`))}
		{/snippet}
	</Zoom>
{:else if renderState.kind === 'failed'}
	<div class={`error ${className}`}>
		<div class="error-head">
			<span>Mermaid error</span>
			<button
				type="button"
				onclick={copyError}
				aria-label={copied ? 'Message copied' : 'Copy the message'}
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
		/* Zoom sets both variables to none in its plate, so the same markup is the fitted preview
		   and the full size original. */
		max-width: var(--zoom-max-width, 100%);
		max-height: var(--zoom-max-height, 24rem);
		margin: auto;
		line-height: 0;
	}

	.diagram :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		/* Inherited, so it is 24rem in a preview and none in the Zoom plate. */
		max-height: inherit;
	}

	/* Explicit, because the plate suppresses selection while a drag is live and a label is the one
	   thing in a diagram worth copying. */
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

	/* Same plate rule as Zoom: base with a surface1 hairline, one step above its ground. */
	.error {
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
		background: var(--catppuccin-color-base);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.75rem;
		box-shadow: 0 0.5rem 1.5rem color-mix(in srgb, var(--catppuccin-color-crust) 56%, transparent);
	}

	.error-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 0.75rem 0.75rem 1.25rem;
		color: var(--catppuccin-color-red);
		font-weight: 600;
		font-size: 1.1rem;
		background: var(--catppuccin-color-mantle);
		border-bottom: 1px solid var(--catppuccin-color-surface1);
	}

	.error-head button {
		display: grid;
		width: 2.25rem;
		height: 2.25rem;
		place-items: center;
		padding: 0;
		color: var(--catppuccin-color-text);
		background: var(--catppuccin-color-surface0);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.5rem;
		cursor: pointer;
	}

	/* The icon swap alone reads as a static relabel, so the check arrives green and grows into place. */
	.check {
		display: grid;
		color: var(--catppuccin-color-green);
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

	.error-head button:hover {
		background: var(--catppuccin-color-surface1);
	}

	.error-head button:focus-visible {
		outline: 3px solid var(--catppuccin-color-sapphire);
		outline-offset: 3px;
	}

	.error-body {
		max-height: 24rem;
		margin: 0;
		padding: 1.25rem;
		overflow: auto;
		color: var(--catppuccin-color-text);
		font-size: 0.95rem;
		font-family: 'Monaspace Neon', ui-monospace, monospace;
		line-height: 1.5;
		text-align: left;
		white-space: pre-wrap;
		/* The whole point of this panel: the message must be selectable and copyable. */
		user-select: text;
		tab-size: 2;
	}
</style>
