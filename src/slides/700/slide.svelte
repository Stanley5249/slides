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

<Slide>
  <h2>A diagram should look native to the deck</h2>

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

<Slide>
  <h2>Wide diagrams need a closer view</h2>

  <div class="row">
    <p>
      The slide keeps the full diagram visible as a preview. The viewer opens a
      fitted version that the audience can inspect by dragging.
    </p>

    <figure>
      <Mermaid code={wide} label="Open the wide diagram" />
      <figcaption>Sixteen stages across, one click away.</figcaption>
    </figure>
  </div>
</Slide>

<Slide>
  <h2>Rendering errors should be impossible to miss</h2>

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
