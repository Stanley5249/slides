<script lang="ts">
  import { Mermaid } from "$lib";

  const diagram = `flowchart LR
		Start --> --> Middle
		Middle -->[[[ End`;
</script>

<p class="text-6xl font-bold drop-shadow-sm">🧜 When It Breaks</p>

<Mermaid
  code={diagram}
  label="Open the diagram"
  class="mx-auto mt-16 w-5xl max-w-[80vw]"
/>

<p class="mt-8 text-3xl">
  Bad source shows the message in place, ready to copy.
</p>
