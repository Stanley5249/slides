<script lang="ts">
	import { MermaidZoom } from '$lib';

	const diagram = `flowchart LR
		Coffee --> Code
		Code --> Bug
		Bug --> Coffee
		Code --> Ship`;
</script>

<p class="text-6xl font-bold drop-shadow-sm">🧜 Mermaid Diagrams</p>

<MermaidZoom code={diagram} label="Open the diagram" class="mx-auto mt-16 w-256 max-w-[80vw]" />

<p class="mt-8 text-3xl">Click the diagram to zoom.</p>
