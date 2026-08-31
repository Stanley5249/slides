<script lang="ts" module>
	let componentId = 0;
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { getPresentation } from '@animotion/core';
	import { tick } from 'svelte';
	import Check from 'lucide-svelte/icons/check';
	import Copy from 'lucide-svelte/icons/copy';
	import Minus from 'lucide-svelte/icons/minus';
	import Plus from 'lucide-svelte/icons/plus';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import X from 'lucide-svelte/icons/x';
	import { renderMermaid } from '$lib/mermaid';

	type Props = {
		code: string;
		label?: string;
		class?: string;
	};

	type RenderState =
		{ kind: 'rendering' } | { kind: 'ready'; svg: string } | { kind: 'failed'; message: string };

	type DragState = {
		pointerId: number;
		offsetX: number;
		offsetY: number;
		startX: number;
		startY: number;
		fromBackground: boolean;
		moved: boolean;
	};

	let { code, label = 'Open Mermaid diagram', class: className = '' }: Props = $props();

	// Low enough that a tall diagram can actually be fitted whole.
	const minScale = 0.1;
	const maxScale = 4;
	// Ceiling for the automatic fit only, so a small diagram opens comfortably instead of enormous.
	const maxFitScale = 2;
	const scaleStep = 0.25;
	const panStep = 48;
	const instanceId = ++componentId;

	let dialog: HTMLDialogElement | undefined;
	// Conditionally rendered, so these bindings are reassigned and need signals.
	let viewport = $state<HTMLDivElement>();
	let canvas = $state<HTMLDivElement>();
	let plate = $state<HTMLElement>();
	let renderState = $state<RenderState>({ kind: 'rendering' });
	let viewerSvg = $state<string>();
	let camera = $state(createCamera());
	let drag = $state<DragState | null>(null);
	let copied = $state(false);
	// Plain lets, not $state: the render effect writes to them, so a signal here would loop.
	let viewerRender: Promise<string> | undefined;
	let renderRequest = 0;

	function createCamera() {
		return { scale: 1, x: 0, y: 0 };
	}

	$effect(() => {
		if (!browser) return;

		const request = ++renderRequest;
		const source = code;
		let cancelled = false;
		if (dialog?.open) dialog.close();
		viewerSvg = undefined;
		viewerRender = undefined;
		renderState = { kind: 'rendering' };

		void (async () => {
			try {
				const svg = await renderMermaid(source, `mermaid-zoom-${instanceId}-${request}-preview`);
				if (cancelled) return;
				renderState = { kind: 'ready', svg };
			} catch (error) {
				if (cancelled) return;
				renderState = { kind: 'failed', message: describe(error) };
			}
			await layoutPresentation(() => !cancelled);
		})();

		return () => {
			cancelled = true;
		};
	});

	function describe(error: unknown) {
		return error instanceof Error ? error.message : 'Could not render this diagram.';
	}

	async function layoutPresentation(isAlive: () => boolean) {
		await tick();
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		if (isAlive()) getPresentation().slides?.layout();
	}

	// The default view: whichever edge runs out first decides the scale, capped by maxFitScale.
	async function resetView() {
		camera = createCamera();
		await tick();
		if (!viewport || !canvas || !plate) return;

		// Mermaid ships the SVG with width="100%", which has no definite basis inside a shrink-to-fit
		// plate and collapses every diagram to the same arbitrary width. Pin it to the viewBox instead,
		// so the plate lays out at the diagram's real size and the camera is the only thing scaling.
		const svg = plate.querySelector('svg');
		const viewBox = svg?.getAttribute('viewBox')?.split(/\s+/).map(Number);
		if (svg && viewBox?.length === 4) {
			svg.style.width = `${viewBox[2]}px`;
			svg.style.maxWidth = 'none';
		}
		await tick();

		const padding = getComputedStyle(canvas);
		const availableWidth =
			viewport.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
		const availableHeight =
			viewport.clientHeight - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
		// offsetWidth/Height are layout sizes, unaffected by the camera transform.
		const fit = Math.min(availableWidth / plate.offsetWidth, availableHeight / plate.offsetHeight);
		camera.scale = Math.min(maxFitScale, Math.max(minScale, fit));
	}

	async function copyError() {
		if (renderState.kind !== 'failed') return;
		await navigator.clipboard.writeText(renderState.message);
		copied = true;
	}

	function open() {
		if (renderState.kind === 'rendering' || !dialog) return;
		dialog.showModal();
		if (renderState.kind === 'failed') return;

		// The viewer copy is rendered lazily: most previews are never opened.
		viewerRender ??= renderMermaid(code, `mermaid-zoom-${instanceId}-${renderRequest}-viewer`);
		const pending = viewerRender;
		void pending.then(
			(svg) => {
				if (viewerRender !== pending) return;
				viewerSvg = svg;
				void resetView();
			},
			(error) => {
				if (viewerRender === pending) renderState = { kind: 'failed', message: describe(error) };
			}
		);
	}

	function close() {
		dialog?.close();
	}

	function handleDialogClose() {
		camera = createCamera();
		drag = null;
		copied = false;
	}

	function setScale(nextScale: number, clientX?: number, clientY?: number) {
		const previousScale = camera.scale;
		const boundedScale = Math.min(maxScale, Math.max(minScale, nextScale));
		if (boundedScale === previousScale) return;

		if (clientX !== undefined && clientY !== undefined && viewport) {
			const bounds = viewport.getBoundingClientRect();
			const pointerX = clientX - (bounds.left + bounds.width / 2);
			const pointerY = clientY - (bounds.top + bounds.height / 2);
			const ratio = boundedScale / previousScale;
			camera.x = pointerX - (pointerX - camera.x) * ratio;
			camera.y = pointerY - (pointerY - camera.y) * ratio;
		}

		camera.scale = boundedScale;
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		event.stopPropagation();
		const factor = Math.exp(-event.deltaY * 0.0015);
		setScale(camera.scale * factor, event.clientX, event.clientY);
	}

	const panKeys: Record<string, [number, number]> = {
		ArrowLeft: [panStep, 0],
		ArrowRight: [-panStep, 0],
		ArrowUp: [0, panStep],
		ArrowDown: [0, -panStep]
	};

	function handleKeydown(event: KeyboardEvent) {
		// Reveal listens on document, so the deck must not navigate while the viewer is open.
		event.stopPropagation();

		const pan = panKeys[event.key];
		if (pan) {
			event.preventDefault();
			camera.x += pan[0];
			camera.y += pan[1];
		} else if (event.key === '+' || event.key === '=') {
			setScale(camera.scale + scaleStep);
		} else if (event.key === '-') {
			setScale(camera.scale - scaleStep);
		} else if (event.key === '0') {
			resetView();
		}
	}

	function startDrag(event: PointerEvent) {
		if (event.button !== 0 || drag || !viewport) return;
		event.preventDefault();
		event.stopPropagation();
		drag = {
			pointerId: event.pointerId,
			offsetX: event.clientX - camera.x,
			offsetY: event.clientY - camera.y,
			startX: event.clientX,
			startY: event.clientY,
			fromBackground: !(event.target instanceof Element) || !event.target.closest('.full-diagram'),
			moved: false
		};
		viewport.setPointerCapture(event.pointerId);
	}

	function moveDrag(event: PointerEvent) {
		if (drag?.pointerId !== event.pointerId) return;

		if (Math.abs(event.clientX - drag.startX) > 3 || Math.abs(event.clientY - drag.startY) > 3) {
			drag.moved = true;
		}

		camera.x = event.clientX - drag.offsetX;
		camera.y = event.clientY - drag.offsetY;
	}

	function stopDrag(event: PointerEvent, dismissOnTap = true) {
		if (drag?.pointerId !== event.pointerId) return;

		const dismiss = dismissOnTap && drag.fromBackground && !drag.moved;
		drag = null;
		if (dismiss) close();
	}
</script>

<button
	type="button"
	class={`preview ${className}`}
	onclick={open}
	aria-label={label}
	aria-busy={renderState.kind === 'rendering'}
	disabled={renderState.kind === 'rendering'}
>
	{#if renderState.kind === 'failed'}
		<span class="error">
			<span class="error-title">Mermaid could not render this diagram</span>
			<span class="error-hint">Click to see the message</span>
		</span>
	{:else if renderState.kind === 'ready'}
		<span class="diagram preview-diagram">{@html renderState.svg}</span>
	{:else}
		<span class="loading">Rendering diagram…</span>
	{/if}
</button>

<dialog
	bind:this={dialog}
	class="viewer"
	onclose={handleDialogClose}
	onkeydown={(event) => event.stopPropagation()}
	onclick={(event) => {
		// Only fires in the error view: the viewport covers the dialog when a diagram is shown, and
		// handles its own blank-area tap.
		if (event.target === dialog) close();
	}}
>
	{#if renderState.kind === 'failed'}
		<div class="error-panel">
			<div class="error-head">
				<span>Mermaid error</span>
				<button type="button" onclick={copyError} title="Copy the message">
					{#if copied}
						<Check size={16} strokeWidth={2.25} />
						Copied
					{:else}
						<Copy size={16} strokeWidth={2.25} />
						Copy
					{/if}
				</button>
			</div>
			<pre class="error-body">{renderState.message}</pre>
		</div>
	{:else}
		<!-- Deliberate: the viewport is a real keyboard-operable pan/zoom surface, not decorative. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
		<div
			bind:this={viewport}
			class:dragging={drag !== null}
			class="viewport"
			role="application"
			tabindex="0"
			aria-label="Zoomed Mermaid diagram. Arrow keys pan, plus and minus zoom, zero resets."
			onwheel={handleWheel}
			onkeydown={handleKeydown}
			onpointerdown={startDrag}
			onpointermove={moveDrag}
			onpointerup={stopDrag}
			onlostpointercapture={(event) => stopDrag(event, false)}
		>
			<div
				bind:this={canvas}
				class="canvas"
				style:transform={`translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`}
			>
				{#if viewerSvg}
					<span bind:this={plate} class="diagram full-diagram">{@html viewerSvg}</span>
				{:else}
					<span class="loading">Rendering diagram…</span>
				{/if}
			</div>
		</div>
	{/if}

	<button type="button" class="close" onclick={close} aria-label="Close diagram" title="Close">
		<X size={22} strokeWidth={2.25} />
	</button>

	{#if renderState.kind !== 'failed'}
		<div class="zoom-controls" role="group" aria-label="Diagram zoom controls">
			<button
				type="button"
				onclick={() => setScale(camera.scale - scaleStep)}
				disabled={camera.scale <= minScale}
				aria-label="Zoom out"
				title="Zoom out"
			>
				<Minus size={21} strokeWidth={2.25} />
			</button>
			<button
				type="button"
				class="percentage"
				onclick={resetView}
				aria-label="Reset zoom"
				title="Reset zoom"
			>
				<RotateCcw size={16} strokeWidth={2.25} />
				{Math.round(camera.scale * 100)}%
			</button>
			<button
				type="button"
				onclick={() => setScale(camera.scale + scaleStep)}
				disabled={camera.scale >= maxScale}
				aria-label="Zoom in"
				title="Zoom in"
			>
				<Plus size={21} strokeWidth={2.25} />
			</button>
		</div>
	{/if}
</dialog>

<style>
	/* Plate rule: every diagram surface is base with a surface1 hairline, one step above its ground. */
	.preview {
		display: block;
		width: 100%;
		min-height: 8rem;
		padding: 1rem;
		overflow: hidden;
		color: var(--catppuccin-color-text);
		background: var(--catppuccin-color-base);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.75rem;
		box-shadow: 0 0.5rem 1.5rem color-mix(in srgb, var(--catppuccin-color-crust) 56%, transparent);
		cursor: zoom-in;
	}

	.preview:hover {
		border-color: var(--catppuccin-color-blue);
	}

	.preview:disabled {
		cursor: wait;
	}

	.preview:focus-visible,
	.close:focus-visible,
	.zoom-controls button:focus-visible {
		outline: 3px solid var(--catppuccin-color-sapphire);
		outline-offset: 3px;
	}

	.viewport:focus-visible {
		outline: 3px solid var(--catppuccin-color-sapphire);
		outline-offset: -3px;
	}

	.diagram {
		display: block;
		line-height: 0;
	}

	.preview-diagram {
		display: grid;
		min-height: 6rem;
		/* Stretch horizontally: a centred grid item shrink-wraps, which collapses a wide diagram. */
		place-items: center stretch;
	}

	.preview-diagram :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		max-height: 24rem;
		margin: auto;
	}

	.loading,
	.error {
		display: grid;
		min-height: 6rem;
		place-items: center;
		font-size: 1rem;
		line-height: 1.4;
	}

	.error {
		gap: 0.4rem;
		color: var(--catppuccin-color-red);
	}

	.error-title {
		font-weight: 600;
	}

	.error-hint {
		color: var(--catppuccin-color-subtext0);
		font-size: 0.85rem;
	}

	.error-panel {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		flex-direction: column;
		width: min(64rem, calc(100dvw - 2 * var(--canvas-side)));
		max-height: calc(100dvh - 8rem);
		overflow: hidden;
		background: var(--catppuccin-color-base);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.75rem;
		box-shadow: 0 1.25rem 3.5rem color-mix(in srgb, var(--catppuccin-color-crust) 78%, transparent);
		transform: translate(-50%, -50%);
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
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.8rem;
		color: var(--catppuccin-color-text);
		font: inherit;
		font-weight: 500;
		font-size: 0.9rem;
		background: var(--catppuccin-color-surface0);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.5rem;
		cursor: pointer;
	}

	.error-head button:hover {
		background: var(--catppuccin-color-surface1);
	}

	.error-head button:focus-visible {
		outline: 3px solid var(--catppuccin-color-sapphire);
		outline-offset: 3px;
	}

	.error-body {
		margin: 0;
		padding: 1.25rem;
		overflow: auto;
		color: var(--catppuccin-color-text);
		font-size: 0.95rem;
		font-family: 'Monaspace Neon', ui-monospace, monospace;
		line-height: 1.5;
		white-space: pre-wrap;
		/* The whole point of this window: the message must be selectable and copyable. */
		user-select: text;
		tab-size: 2;
	}

	.viewer {
		--canvas-side: 3rem;
		--toolbar-inset: clamp(1.5rem, 8vh, 10rem);
		/* Toolbar height plus breathing room, so the canvas never runs under the controls. */
		--toolbar-space: calc(var(--toolbar-inset) + 4rem);

		position: fixed;
		inset: 0;
		width: 100dvw;
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
		color: var(--catppuccin-color-text);
		background: transparent;
		border: 0;
		transform: none;
	}

	.viewer::backdrop {
		background: color-mix(in srgb, var(--catppuccin-color-crust) 78%, transparent);
		backdrop-filter: blur(5px);
	}

	.viewport {
		position: absolute;
		inset: 0;
		overflow: hidden;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}

	.viewport.dragging {
		cursor: grabbing;
	}

	.canvas {
		position: absolute;
		inset: 0;
		/* Vertically symmetric on purpose: the grid centres the plate in the content box while the
		   camera scales about the canvas centre, so the two must be the same point. */
		padding: var(--toolbar-space) var(--canvas-side);
		transform-origin: center;
		will-change: transform;
	}

	/* Centred with a transform, not with grid or flex: those start-align an item larger than their
	   area, which pushed a tall diagram off the bottom as soon as the camera scaled it. */
	.canvas > :global(*) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.full-diagram {
		background: var(--catppuccin-color-base);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.75rem;
		box-shadow: 0 1.25rem 3.5rem color-mix(in srgb, var(--catppuccin-color-crust) 78%, transparent);
	}

	/* No fitting here: Mermaid's inline max-width is the diagram's natural size, so 100% means 100%
	   and the camera is the only thing that scales. Oversized diagrams overflow and are panned. */
	.full-diagram :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 2;
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		place-items: center;
		padding: 0;
		color: var(--catppuccin-color-text);
		background: transparent;
		border: 0;
		border-radius: 0.5rem;
		cursor: pointer;
	}

	.close:hover {
		background: color-mix(in srgb, var(--catppuccin-color-surface0) 80%, transparent);
	}

	.zoom-controls {
		position: absolute;
		bottom: var(--toolbar-inset);
		left: 50%;
		z-index: 2;
		display: flex;
		align-items: stretch;
		background: color-mix(in srgb, var(--catppuccin-color-mantle) 92%, transparent);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.6rem;
		box-shadow: 0 0.5rem 1.5rem color-mix(in srgb, var(--catppuccin-color-crust) 62%, transparent);
		transform: translateX(-50%);
		backdrop-filter: blur(12px);
	}

	.zoom-controls button {
		display: grid;
		min-width: 2.5rem;
		place-items: center;
		padding: 0.45rem 0.7rem;
		font: inherit;
		font-size: 1rem;
		color: var(--catppuccin-color-text);
		background: transparent;
		border: 0;
		cursor: pointer;
	}

	/* No overflow clipping on the bar: it would cut the focus ring off. */
	.zoom-controls button:first-child {
		border-radius: 0.5rem 0 0 0.5rem;
	}

	.zoom-controls button:last-child {
		border-radius: 0 0.5rem 0.5rem 0;
	}

	.zoom-controls button:hover:not(:disabled) {
		background: var(--catppuccin-color-surface0);
	}

	.zoom-controls button:disabled {
		color: var(--catppuccin-color-overlay0);
		cursor: default;
	}

	.zoom-controls .percentage {
		grid-auto-flow: column;
		gap: 0.4rem;
		min-width: 5.5rem;
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 640px) {
		.viewer {
			--canvas-side: 1rem;
		}
	}
</style>
