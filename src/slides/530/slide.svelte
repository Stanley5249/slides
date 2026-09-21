<script lang="ts">
  import { Mermaid } from "$lib";

  const stages = Array.from(
    { length: 15 },
    (_, i) => `N${i}[Stage ${i}] --> N${i + 1}[Stage ${i + 1}]`,
  );
  const diagram = `flowchart LR\n\t\t${stages.join("\n\t\t")}`;
</script>

<p class="text-6xl font-bold drop-shadow-sm">🧜 Very Wide</p>

<Mermaid
  code={diagram}
  label="Open the wide diagram"
  class="mx-auto mt-16 w-256 max-w-[80vw]"
/>

<p class="mt-8 text-3xl">Sixteen stages across, drag to follow the chain.</p>
