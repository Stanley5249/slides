<script lang="ts">
  import { Mermaid } from "$lib";

  const diagram = `flowchart LR
		Write[Write slides] --> Check[just ci]
		Check --> Present
		Check --> Fix
		Fix --> Write`;
</script>

<p class="act">The components</p>

<h2>Diagrams are drawn in the deck's own colors</h2>

<div class="cols narrow-first">
  <div class="row">
    <p>
      Mermaid is themed from the role tokens, read live from the document, so a
      diagram belongs to the slide rather than to its library.
    </p>
    <p class="note">Click it to open the viewer.</p>
  </div>

  <figure>
    <Mermaid code={diagram} label="Open the workflow diagram" />
    <figcaption>The loop this template is built around.</figcaption>
  </figure>
</div>
