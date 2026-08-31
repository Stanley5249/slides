<script lang="ts" module>
	let renderId = 0;
</script>

<script lang="ts">
	import { browser } from '$app/environment';

	type Props = {
		code: string;
		label?: string;
		class?: string;
	};

	let { code, label = 'Open Mermaid diagram', class: className = '' }: Props = $props();

	const minScale = 0.5;
	const maxScale = 4;
	const scaleStep = 0.25;

	let dialog: HTMLDialogElement;
	let viewport: HTMLDivElement;
	let diagramHtml = $state('');
	let renderError = $state('');
	let scale = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let dragging = $state(false);
	let dragPointer = -1;
	let dragX = 0;
	let dragY = 0;

	$effect(() => {
		if (!browser) return;

		const source = code;
		let cancelled = false;
		diagramHtml = '';
		renderError = '';

		void (async () => {
			try {
				const { default: mermaid } = await import('mermaid');
				mermaid.initialize({
					startOnLoad: false,
					securityLevel: 'strict',
					theme: 'dark'
				});
				const result = await mermaid.render(`mermaid-zoom-${++renderId}`, source);
				if (!cancelled) diagramHtml = result.svg;
			} catch (error) {
				if (!cancelled) {
					renderError = error instanceof Error ? error.message : 'Could not render this diagram.';
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	function resetView() {
		scale = 1;
		panX = 0;
		panY = 0;
	}

	function open() {
		resetView();
		dialog.showModal();
	}

	function close() {
		dialog.close();
	}

	function setScale(nextScale: number, clientX?: number, clientY?: number) {
		const previousScale = scale;
		const boundedScale = Math.min(maxScale, Math.max(minScale, nextScale));
		if (boundedScale === previousScale) return;

		if (clientX !== undefined && clientY !== undefined) {
			const bounds = viewport.getBoundingClientRect();
			const pointerX = clientX - (bounds.left + bounds.width / 2);
			const pointerY = clientY - (bounds.top + bounds.height / 2);
			const ratio = boundedScale / previousScale;
			panX = pointerX - (pointerX - panX) * ratio;
			panY = pointerY - (pointerY - panY) * ratio;
		}

		scale = boundedScale;
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		event.stopPropagation();
		const factor = Math.exp(-event.deltaY * 0.0015);
		setScale(scale * factor, event.clientX, event.clientY);
	}

	function startDrag(event: PointerEvent) {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		dragging = true;
		dragPointer = event.pointerId;
		dragX = event.clientX - panX;
		dragY = event.clientY - panY;
		viewport.setPointerCapture(event.pointerId);
	}

	function moveDrag(event: PointerEvent) {
		if (!dragging || event.pointerId !== dragPointer) return;
		panX = event.clientX - dragX;
		panY = event.clientY - dragY;
	}

	function stopDrag(event: PointerEvent) {
		if (event.pointerId !== dragPointer) return;
		dragging = false;
		dragPointer = -1;
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
>
	{#if renderError}
		<span class="error">{renderError}</span>
	{:else if diagramHtml}
		<span class="diagram preview-diagram">{@html diagramHtml}</span>
	{:else}
		<span class="loading">Rendering diagram…</span>
	{/if}
</button>

<dialog
	bind:this={dialog}
	class="viewer"
	onclick={(event) => event.stopPropagation()}
	onkeydown={(event) => event.stopPropagation()}
	onclose={resetView}
>
	<div
		bind:this={viewport}
		class:dragging
		class="viewport"
		role="application"
		aria-label="Zoomed Mermaid diagram. Use the mouse wheel to zoom and drag to pan."
		onwheel={handleWheel}
		onpointerdown={startDrag}
		onpointermove={moveDrag}
		onpointerup={stopDrag}
		onpointercancel={stopDrag}
	>
		<div class="canvas" style:transform={`translate3d(${panX}px, ${panY}px, 0) scale(${scale})`}>
			<span class="diagram full-diagram">{@html diagramHtml}</span>
		</div>
	</div>

	<button type="button" class="close" onclick={close} aria-label="Close diagram">×</button>

	<div class="controls">
		<button type="button" onclick={() => setScale(scale - scaleStep)} aria-label="Zoom out"
			>−</button
		>
		<button type="button" class="percentage" onclick={resetView} aria-label="Reset zoom">
			{Math.round(scale * 100)}%
		</button>
		<button type="button" onclick={() => setScale(scale + scaleStep)} aria-label="Zoom in">+</button
		>
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

	.preview:focus-visible,
	.close:focus-visible,
	.controls button:focus-visible {
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
		width: 92vw;
		max-width: none;
		height: 88vh;
		max-height: none;
		padding: 0;
		overflow: hidden;
		color: var(--catppuccin-color-text);
		background: var(--catppuccin-color-base);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 1rem;
		box-shadow: 0 1.5rem 5rem rgb(0 0 0 / 45%);
	}

	.viewer::backdrop {
		background: rgb(10 10 20 / 75%);
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
		transform-origin: center;
		will-change: transform;
	}

	.full-diagram :global(svg) {
		display: block;
		width: min(78vw, 75rem);
		max-width: none;
		height: min(68vh, 50rem);
	}

	.close {
		position: absolute;
		top: 0.75rem;
		right: 0.9rem;
		display: grid;
		width: 2.5rem;
		height: 2.5rem;
		place-items: center;
		padding: 0;
		font: inherit;
		font-size: 2rem;
		line-height: 1;
		color: var(--catppuccin-color-text);
		background: var(--catppuccin-color-mantle);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 999px;
		cursor: pointer;
	}

	.controls {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		display: flex;
		overflow: hidden;
		background: var(--catppuccin-color-mantle);
		border: 1px solid var(--catppuccin-color-surface1);
		border-radius: 0.6rem;
		box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 25%);
		transform: translateX(-50%);
	}

	.controls button {
		min-width: 2.5rem;
		padding: 0.45rem 0.7rem;
		font: inherit;
		font-size: 1rem;
		color: var(--catppuccin-color-text);
		background: transparent;
		border: 0;
		cursor: pointer;
	}

	.controls button:hover {
		background: var(--catppuccin-color-surface0);
	}

	.controls .percentage {
		min-width: 4.5rem;
		border-right: 1px solid var(--catppuccin-color-surface1);
		border-left: 1px solid var(--catppuccin-color-surface1);
	}
</style>
