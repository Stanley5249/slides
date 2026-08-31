<script lang="ts">
	import { MermaidZoom } from '$lib';

	const diagram = [
		'flowchart TD',
		'Start((Start)) --> Rendering[Rendering]',
		'Rendering -->|SVGs ready| Ready[Ready]',
		'Rendering -->|Render error| Failed[Failed]',
		'Failed -->|Source changes| Rendering',
		'Ready -->|Open preview| Inspecting[Inspecting]',
		'Inspecting -->|Left drag| Panning[Panning]',
		'Panning -->|Pointer up or cancel| Inspecting',
		'Inspecting -->|Close, Escape, or backdrop| Ready',
		'Ready -->|Source changes| Rendering'
	].join('\n');
</script>

<div class="mx-auto w-[76rem] max-w-[90vw]">
	<h2 class="text-mauve text-5xl font-bold">Mermaid Zoom State Machine</h2>
	<p class="text-subtext0 mt-3 text-2xl">
		Rendering, inspection, and panning are explicit reactive states.
	</p>

	<MermaidZoom code={diagram} label="Open the Mermaid interaction demo" class="mt-8" />

	<p class="text-overlay1 mt-4 text-xl">
		Source changes return to rendering; Mermaid-ready relayouts the slide.
	</p>
</div>
