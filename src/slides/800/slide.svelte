<script lang="ts">
  import { Slide } from "@animotion/core";
  import { Shot } from "$lib";
</script>

<Slide>
  <h2>A screenshot is evidence</h2>

  <div class="cols narrow-first">
    <div class="row">
      <p>
        <code>Shot</code> takes a source, the words a screen reader is given, and
        a caption. The picture opens in the viewer a diagram opens in.
      </p>
      <p>No plate and no border. A picture is already a rectangle.</p>
    </div>

    <Shot
      src="https://placehold.co/1280x720/ccd0da/4c4f69/png?text=Your+screenshot+here"
      alt="A stand-in for the screenshot this slide would carry"
      caption="A real deck points this at a file in static/."
    />
  </div>
</Slide>

<Slide>
  <h2>A missing file says so</h2>

  <div class="cols">
    <Shot src="/not-written-yet.png" alt="The screenshot for this slide" />

    <div class="row">
      <p>
        A file that has not been made yet must not leave a hole nobody notices,
        so the slot draws itself and prints the path it went looking for.
      </p>
      <p>The deck still builds. The gap is visible from the back row.</p>
    </div>
  </div>
</Slide>
