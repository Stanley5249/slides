<script lang="ts">
  import { asset } from "$app/paths";
  import { Slide } from "@animotion/core";
  import { Shot } from "$lib";
</script>

<Slide>
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
      src="https://placehold.co/1280x720/ccd0da/4c4f69/png?text=Your+screenshot+here"
      alt="A stand-in for the screenshot this slide would carry"
      caption="A real deck points this at a file in static/."
    />
  </div>
</Slide>

<Slide>
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
