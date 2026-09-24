<script lang="ts">
  import { asset } from "$app/paths";
  import { Slide } from "@animotion/core";
  import { Shot } from "$lib";
</script>

<Slide class="middle">
  <h2>Use screenshots as evidence, not decoration</h2>

  <div class="cols narrow-first">
    <div class="row">
      <p>
        <code>Shot</code> pairs the image with alternative text and an optional caption.
        Select the image to inspect it in the same viewer as a diagram.
      </p>
      <p>
        The screenshot needs no extra frame because its content is the focus.
      </p>
    </div>

    <Shot
      src={asset("/placeholder-window.svg")}
      alt="An empty application window standing in for a screenshot"
      caption="Replace this with a capture of the app you are showing."
    />
  </div>
</Slide>

<Slide class="middle">
  <h2>Missing evidence should remain visible</h2>

  <div class="cols">
    <Shot
      src={asset("/not-written-yet.png")}
      alt="The screenshot for this slide"
    />

    <div class="row">
      <p>
        When an image is missing, its slot remains visible and reports the path
        that failed to load.
      </p>
      <p>The deck still builds, but the unfinished work cannot hide.</p>
    </div>
  </div>
</Slide>
