<script lang="ts" module>
	let componentId = 0;
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { getPresentation } from '@animotion/core';
	import { tick } from 'svelte';
	import Minus from 'lucide-svelte/icons/minus';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import { renderMermaidPair } from '$lib/mermaid';

	type Props = {
		code: string;
		label?: string;
		class?: string;
	};

	type RenderState =
		| { kind: 'rendering' }
		| { kind: 'ready'; previewSvg: string; viewerSvg: string }
		| { kind: 'failed'; message: string };

	type Camera = {
		scale: number;
		x: number;
		y: number;
	};

	type DragState = {
		pointerId: number;
		offsetX: number;
		offsetY: number;
		startX: number;
		startY: number;
		fromBackground: boolean;
		moved: boolean;
	};

	type ViewerState =
		| { kind: 'closed'; camera: Camera }
		| { kind: 'open'; camera: Camera }
		| { kind: 'dragging'; camera: Camera; drag: DragState };

	let { code, label = 'Open Mermaid diagram', class: className = '' }: Props = $props();

	const minScale = 0.5;
	const maxScale = 4;
	const scaleStep = 0.25;
	const instanceId = ++componentId;

	let dialog: HTMLDialogElement | undefined;
	let viewport: HTMLDivElement | undefined;
	let renderState = $state<RenderState>({ kind: 'rendering' });
	let viewerState = $state<ViewerState>({ kind: 'closed', camera: createCamera() });
	let renderRequest = 0;

	function createCamera(): Camera {
		return { scale: 1, x: 0, y: 0 };
	}

	$effect(() => {
		if (!browser) return;

		const request = ++renderRequest;
		const source = code;
		let cancelled = false;
		if (dialog?.open) dialog.close();
		viewerState = { kind: 'closed', camera: createCamera() };
		renderState = { kind: 'rendering' };

		void (async () => {
			try {
				const diagrams = await renderMermaidPair(source, `mermaid-zoom-${instanceId}-${request}`);
				if (cancelled || request !== renderRequest) return;

				renderState = { kind: 'ready', ...diagrams };
				await layoutPresentation();
			} catch (error) {
				if (cancelled || request !== renderRequest) return;
				renderState = {
					kind: 'failed',
					message: error instanceof Error ? error.message : 'Could not render this diagram.'
				};
				await layoutPresentation();
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	async function layoutPresentation() {
		await tick();
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		getPresentation().slides?.layout();
	}

	function resetView() {
		viewerState.camera = createCamera();
	}

	function open() {
		if (renderState.kind !== 'ready' || !dialog) return;
		viewerState = { kind: 'open', camera: createCamera() };
		dialog.showModal();
	}

	function close() {
		dialog?.close();
	}

	function handleDialogClose() {
		viewerState = { kind: 'closed', camera: createCamera() };
	}

	function handleDialogClick(event: MouseEvent) {
		event.stopPropagation();
	}

	function setScale(nextScale: number, clientX?: number, clientY?: number) {
		const camera = viewerState.camera;
		const previousScale = camera.scale;
		const boundedScale = Math.min(maxScale, Math.max(minScale, nextScale));
		if (boundedScale === previousScale) return;

		let x = camera.x;
		let y = camera.y;

		if (clientX !== undefined && clientY !== undefined && viewport) {
			const bounds = viewport.getBoundingClientRect();
			const pointerX = clientX - (bounds.left + bounds.width / 2);
			const pointerY = clientY - (bounds.top + bounds.height / 2);
			const ratio = boundedScale / previousScale;
			x = pointerX - (pointerX - camera.x) * ratio;
			y = pointerY - (pointerY - camera.y) * ratio;
		}

		viewerState.camera = { scale: boundedScale, x, y };
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		event.stopPropagation();
		const factor = Math.exp(-event.deltaY * 0.0015);
		setScale(viewerState.camera.scale * factor, event.clientX, event.clientY);
	}

	function startDrag(event: PointerEvent) {
		if (event.button !== 0 || !viewport) return;
		event.preventDefault();
		event.stopPropagation();
		const camera = viewerState.camera;
		viewerState = {
			kind: 'dragging',
			camera,
			drag: {
				pointerId: event.pointerId,
				offsetX: event.clientX - camera.x,
				offsetY: event.clientY - camera.y,
				startX: event.clientX,
				startY: event.clientY,
				fromBackground:
					!(event.target instanceof Element) || !event.target.closest('.full-diagram'),
				moved: false
			}
		};
		viewport.setPointerCapture(event.pointerId);
	}

	function moveDrag(event: PointerEvent) {
		if (viewerState.kind !== 'dragging' || event.pointerId !== viewerState.drag.pointerId) return;

		if (
			Math.abs(event.clientX - viewerState.drag.startX) > 3 ||
			Math.abs(event.clientY - viewerState.drag.startY) > 3
		) {
			viewerState.drag.moved = true;
		}

		viewerState.camera = {
			...viewerState.camera,
			x: event.clientX - viewerState.drag.offsetX,
			y: event.clientY - viewerState.drag.offsetY
		};
	}

	function stopDrag(event: PointerEvent, dismissOnTap = true) {
		if (viewerState.kind !== 'dragging' || event.pointerId !== viewerState.drag.pointerId) return;

		const { camera, drag } = viewerState;
		const dismiss = dismissOnTap && drag.fromBackground && !drag.moved;
		viewerState = { kind: 'open', camera };
		if (dismiss) close();
	}
</script>

<button
	type="button"
	class={`preview ${className}`}
	onclick={(event) => {
		event.stopPropagation();
		open();
	}}
	aria-label={label}
	aria-busy={renderState.kind === 'rendering'}
	disabled={renderState.kind !== 'ready'}
>
	{#if renderState.kind === 'failed'}
		<span class="error">{renderState.message}</span>
	{:else if renderState.kind === 'ready'}
		<span class="diagram preview-diagram">{@html renderState.previewSvg}</span>
	{:else}
		<span class="loading">Rendering diagram…</span>
	{/if}
</button>

<dialog
	bind:this={dialog}
	class="viewer"
	onclick={handleDialogClick}
	onkeydown={(event) => event.stopPropagation()}
	onclose={handleDialogClose}
>
	<div
		bind:this={viewport}
		class:dragging={viewerState.kind === 'dragging'}
		class="viewport"
		role="application"
		aria-label="Zoomed Mermaid diagram. Use the mouse wheel to zoom and drag to pan."
		onwheel={handleWheel}
		onpointerdown={startDrag}
		onpointermove={moveDrag}
		onpointerup={stopDrag}
		onpointercancel={(event) => stopDrag(event, false)}
	>
		<div
			class="canvas"
			style:transform={`translate3d(${viewerState.camera.x}px, ${viewerState.camera.y}px, 0) scale(${viewerState.camera.scale})`}
		>
			{#if renderState.kind === 'ready'}
				<span class="diagram full-diagram">{@html renderState.viewerSvg}</span>
			{:else if renderState.kind === 'failed'}
				<span class="error">{renderState.message}</span>
			{:else}
				<span class="loading">Rendering diagram…</span>
			{/if}
		</div>
	</div>

	<button type="button" class="close" onclick={close} aria-label="Close diagram" title="Close">
		<X size={22} strokeWidth={2.25} />
	</button>

	<div class="zoom-controls" role="toolbar" aria-label="Diagram zoom controls">
		<button
			type="button"
			onclick={() => setScale(viewerState.camera.scale - scaleStep)}
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
			{Math.round(viewerState.camera.scale * 100)}%
		</button>
		<button
			type="button"
			onclick={() => setScale(viewerState.camera.scale + scaleStep)}
			aria-label="Zoom in"
			title="Zoom in"
		>
			<Plus size={21} strokeWidth={2.25} />
		</button>
	</div>
</dialog>

<style>
	.preview {
		display: block;
		width: 100%;
		min-height: 8rem;
		padding: 1rem;
		overflow: hidden;
		color: var(--catppuccin-color-text);
		background: var(--catppuccin-color-mantle);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.75rem;
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

	.diagram {
		display: block;
		line-height: 0;
	}

	.preview-diagram :global(svg) {
		display: block;
		width: 100%;
		max-height: 24rem;
		margin: auto;
	}

	.preview-diagram {
		display: grid;
		min-height: 6rem;
		place-items: center;
		background: var(--catppuccin-color-base);
		box-shadow: 0 0.5rem 1.5rem color-mix(in srgb, var(--catppuccin-color-crust) 56%, transparent);
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
		color: var(--catppuccin-color-red);
	}

	.viewer {
		position: fixed;
		inset: 0;
		width: 100vw;
		max-width: none;
		height: 100vh;
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
		display: grid;
		place-items: center;
		padding: 4.5rem 3rem 6rem;
		transform-origin: center;
		will-change: transform;
	}

	.full-diagram {
		display: grid;
		place-items: center;
		background: var(--catppuccin-color-base);
		box-shadow: 0 1.25rem 3.5rem color-mix(in srgb, var(--catppuccin-color-crust) 78%, transparent);
	}

	.full-diagram :global(svg) {
		display: block;
		width: min(82vw, 80rem) !important;
		max-width: none !important;
		height: auto !important;
		max-height: calc(100vh - 11rem);
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
		bottom: clamp(1.5rem, 8vh, 10rem);
		left: 50%;
		z-index: 2;
		display: flex;
		align-items: stretch;
		overflow: hidden;
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

	.zoom-controls button:hover {
		background: var(--catppuccin-color-surface0);
	}

	.zoom-controls .percentage {
		min-width: 4.5rem;
		border-right: 1px solid var(--catppuccin-color-surface1);
		border-left: 1px solid var(--catppuccin-color-surface1);
	}

	@media (max-width: 640px) {
		.canvas {
			padding: 3.5rem 1rem 5rem;
		}

		.full-diagram :global(svg) {
			width: 92vw !important;
			max-height: calc(100vh - 9rem);
		}
	}
</style>
