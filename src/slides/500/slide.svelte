<script lang="ts">
	import { MermaidZoom } from '$lib';

	const diagram = `flowchart LR
		Source[Mermaid source] --> Preview[Diagram preview]
		Preview -->|Click| Viewer[Modal viewer]
		Viewer --> Explore{Explore details}
		Explore -->|Mouse wheel| Zoom[Zoom around pointer]
		Explore -->|Left drag| Pan[Move diagram]
		Explore -->|Controls| Buttons[Zoom or reset]
		Zoom --> Close[Escape or close button]
		Pan --> Close
		Buttons --> Close`;
</script>

<div class="mx-auto w-[76rem] max-w-[90vw]">
	<h2 class="text-mauve text-5xl font-bold">Zoomable Mermaid</h2>
	<p class="text-subtext0 mt-3 text-2xl">
		Click the diagram, then zoom with the wheel and drag to pan.
	</p>

	<MermaidZoom code={diagram} label="Open the Mermaid interaction demo" class="mt-8" />

	<p class="text-overlay1 mt-4 text-xl">The percentage button resets the view. Escape closes it.</p>
</div>
