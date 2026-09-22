<script lang="ts">
  import { Mermaid } from "$lib";

  const stages = Array.from(
    { length: 15 },
    (_, i) => `N${i}[Stage ${i}] --> N${i + 1}[Stage ${i + 1}]`,
  );
  const diagram = `flowchart LR\n\t\t${stages.join("\n\t\t")}`;
</script>

<p class="act">The components</p>

<h2>A diagram wider than the wall</h2>

<p class="lede">
  The preview fits the column. The viewer opens it at a scale that fits the
  window, and drags from there.
</p>

<figure>
  <Mermaid code={diagram} label="Open the wide diagram" />
  <figcaption>Sixteen stages across, one click away.</figcaption>
</figure>
