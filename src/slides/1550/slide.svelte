<script lang="ts" module>
  import { asset } from "$app/paths";
  import { defineProps } from "@animotion/core";

  export const props = defineProps({
    class: "bleed",
    image: asset("/earthrise.jpg"),
  });
</script>

<div class="scrim">
  <h2>Let a picture fill the stage</h2>
  <p>
    Pass <code>image</code> to the slide and set the words on a scrim, so they stay
    readable over any picture. This one is Earthrise, taken from Apollo 8 in 1968
    and in the public domain.
  </p>
</div>
