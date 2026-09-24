<script lang="ts">
  import { Notes, Slide } from "@animotion/core";
  import Globe from "lucide-svelte/icons/globe";
  import { Link } from "$lib";

  const site = "https://animotion.pages.dev/";
</script>

<!-- The live site sits one slide down, so the room is told before the stage
     turns into someone else's page, and this slide stays as the way out when
     the site refuses to load in a frame. -->
<Slide class="middle">
  <h2>Embed a live site</h2>

  <div class="row">
    <p>
      The next slide is the site itself, filling the stage. Click into it to use
      it, then click the slide edge before the arrow keys move the deck again.
    </p>

    <p>
      Some sites refuse to load in a frame. Keep the link here so the talk can
      go on in a new tab, and run <code>just embeds</code> before the talk.
    </p>

    <p><Link href={site} icon={Globe}>animotion.pages.dev</Link></p>

    <p class="hint">Press the down arrow to open it.</p>
  </div>
</Slide>

<!-- Reveal draws a background iframe in its own layer behind `.slides`, at the
     full size of the stage. `interactive` hands pointer and keyboard to the
     site, which is the point of embedding a live one. -->
<Slide iframe={site} interactive>
  <Notes>
    The Animotion homepage is sample content and can be replaced with any live
    site. Click into the frame to demonstrate it, then click the slide edge
    before using the arrow keys again.
  </Notes>
</Slide>

<style>
  .hint {
    color: var(--deck-ink-quiet);
  }
</style>
