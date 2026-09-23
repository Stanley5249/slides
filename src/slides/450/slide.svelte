<script lang="ts" module>
  import { defineProps } from "@animotion/core";

  export const props = defineProps({ class: "statement" });
</script>

<script lang="ts">
  import { Notes } from "@animotion/core";
</script>

<figure>
  <blockquote>
    <p>
      Perfection is achieved, not when there is nothing more to add, but when
      there is nothing left to take away.
    </p>
  </blockquote>
  <figcaption>
    Antoine de Saint-Exupéry, <cite>Wind, Sand and Stars</cite>
  </figcaption>
</figure>

<Notes>
  A quote is a statement with a source. Wrap the words in a blockquote inside a
  figure, and credit the source in the figcaption.
</Notes>
