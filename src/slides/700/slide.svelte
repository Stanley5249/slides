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
  <h2>Diagrams are drawn in the deck's own colors</h2>

  <div class="cols narrow-first">
    <div class="row">
      <p>
        Mermaid is themed from the role tokens, read live from the document, so
        a diagram belongs to the slide rather than to its library.
      </p>
      <p>Click it to open the viewer.</p>
    </div>

    <figure>
      <Mermaid code={workflow} label="Open the workflow diagram" />
      <figcaption>The loop this template is built around.</figcaption>
    </figure>
  </div>
</Slide>

<Slide>
  <h2>A diagram wider than the wall</h2>

  <div class="row">
    <p>
      The preview fits the column. The viewer opens it at a scale that fits the
      window, and drags from there.
    </p>

    <figure>
      <Mermaid code={wide} label="Open the wide diagram" />
      <figcaption>Sixteen stages across, one click away.</figcaption>
    </figure>
  </div>
</Slide>

<Slide>
  <h2>A failure is never quiet</h2>

  <div class="cols">
    <Mermaid code={broken} label="Open the broken diagram" />

    <div class="row">
      <p>
        A diagram that did not render must not be mistaken for one that did, so
        the error takes a panel and the message in full.
      </p>
      <p>It is the one place chrome earns its keep.</p>
    </div>
  </div>
</Slide>
