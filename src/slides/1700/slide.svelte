<script lang="ts">
  import { Slide } from "@animotion/core";
  import { Mermaid } from "$lib";

  const workflow = `flowchart LR
		Write[Write slides] --> Check[just ci]
		Check --> Present
		Check --> Fix
		Fix --> Write`;

  const stages = Array.from(
    { length: 15 },
    (_, i) => `N${i}[Stage ${i}] --> N${i + 1}[Stage ${i + 1}]`,
  );
  const wide = `flowchart LR\n\t\t${stages.join("\n\t\t")}`;

  const broken = `flowchart LR
		Start --> --> Middle
		Middle -->[[[ End`;
</script>

<Slide class="middle">
  <h2>Draw diagrams in the deck's colors</h2>

  <div class="cols narrow-first">
    <div class="row">
      <p>
        The diagram uses the same color roles as the surrounding slide. Mermaid
        reads those roles from the document when it renders.
      </p>
      <p>Select the diagram to inspect it in the viewer.</p>
    </div>

    <figure>
      <Mermaid code={workflow} label="Open the workflow diagram" />
      <figcaption>Write, check, fix, and present.</figcaption>
    </figure>
  </div>
</Slide>

<Slide class="middle">
  <h2>Zoom into a wide diagram</h2>

  <div class="row">
    <p>
      The slide shows the whole diagram as a preview. Select it to open a larger
      view you can drag around.
    </p>

    <figure>
      <Mermaid code={wide} label="Open the wide diagram" />
      <figcaption>Sixteen stages across, one click away.</figcaption>
    </figure>
  </div>
</Slide>

<Slide class="middle">
  <h2>Show a diagram that fails to render</h2>

  <div class="cols">
    <Mermaid code={broken} label="Open the broken diagram" />

    <div class="row">
      <p>
        A failed diagram displays its full error instead of leaving an empty
        space that could pass unnoticed.
      </p>
      <p>The visible panel makes the problem clear before the talk begins.</p>
    </div>
  </div>
</Slide>
