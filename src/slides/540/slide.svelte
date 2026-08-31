<script lang="ts">
	import { MermaidZoom } from '$lib';

	const diagram = `flowchart LR
		Start --> --> Middle
		Middle -->[[[ End`;
</script>

<p class="text-6xl font-bold drop-shadow-sm">🧜 When It Breaks</p>

<MermaidZoom
	code={diagram}
	label="Open the error message"
	class="mx-auto mt-16 w-256 max-w-[80vw]"
/>

<p class="mt-8 text-3xl">Bad source opens the message instead, ready to copy.</p>
