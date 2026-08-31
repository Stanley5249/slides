<script lang="ts">
	import { MermaidZoom } from '$lib';

	const steps = Array.from(
		{ length: 22 },
		(_, i) => `S${i}[Step ${i}] --> S${i + 1}[Step ${i + 1}]`
	);
	const diagram = `flowchart TD\n\t\t${steps.join('\n\t\t')}`;
</script>

<p class="text-6xl font-bold drop-shadow-sm">🧜 Very Long</p>

<MermaidZoom
	code={diagram}
	label="Open the long diagram"
	class="mx-auto mt-16 w-256 max-w-[80vw]"
/>

<p class="mt-8 text-3xl">Twenty three steps, fitted to the window on open.</p>
