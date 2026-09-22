<script lang="ts">
  import { Mermaid } from "$lib";

  const diagram = `flowchart LR
		Start --> --> Middle
		Middle -->[[[ End`;
</script>

<p class="act">The components</p>

<h2>A failure is never quiet</h2>

<div class="cols">
  <Mermaid code={diagram} label="Open the broken diagram" />

  <div class="row">
    <p>
      A diagram that did not render must not be mistaken for one that did, so
      the error takes a panel and the message in full.
    </p>
    <p class="note">It is the one place chrome earns its keep.</p>
  </div>
</div>
