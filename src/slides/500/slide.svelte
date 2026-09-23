<script lang="ts">
  import { Slide } from "@animotion/core";
</script>

<Slide>
  <h2>Reveal a list one point at a time</h2>

  <div class="row">
    <ul>
      <li class="fragment">
        Each point waits for the presenter’s next keypress.
      </li>
      <li class="fragment">
        The room reads the point being made, not the three after it.
      </li>
      <li class="fragment">
        Add <code>class="fragment"</code> to any element to hold it back.
      </li>
    </ul>

    <p class="fragment">Press the down arrow for a list that dims.</p>
  </div>
</Slide>

<Slide>
  <h2>Dim the points already made</h2>

  <ul class="dim">
    <li class="fragment">Add <code>dim</code> to the list.</li>
    <li class="fragment">Each point fades once the next one arrives.</li>
    <li class="fragment">The current point keeps its full ink.</li>
  </ul>
</Slide>
